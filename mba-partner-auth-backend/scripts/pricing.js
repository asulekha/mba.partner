const Product = require('../models/Product');
const PromoCode = require('../models/PromoCode');
const Order = require('../models/Order');

// Lightweight error class so controllers can `throw` with a status code
// and let your existing errorHandler middleware format the response.
class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

/**
 * Re-prices a cart against the server-side product catalog. Throws if any
 * item is unknown/inactive — we never fall back to a client-supplied price.
 *
 * @param {Array<{id:string, qty?:number}>} cartFromClient
 */
async function repriceCart(cartFromClient) {
    if (!Array.isArray(cartFromClient) || cartFromClient.length === 0) {
        throw new HttpError(400, 'Cart is empty.');
    }

    const ids = cartFromClient.map((i) => i.id);
    console.log("FULL CART RECEIVED:", JSON.stringify(cartFromClient, null, 2));
    console.log("IDS RECEIVED:", ids);

    const products = await Product.find({ productId: { $in: ids }, active: true });
    console.log("PRODUCTS FOUND:", products);
    const byId = new Map(products.map((p) => [p.productId, p]));

    let originalSubtotal = 0;
    let subtotal = 0;
    const items = [];

    for (const cartItem of cartFromClient) {
        const product = byId.get(cartItem.id);
        if (!product) {
            throw new HttpError(400, `Item "${cartItem.id}" is no longer available.`);
        }
        const qty = Number.isInteger(cartItem.qty) && cartItem.qty > 0 ? cartItem.qty : 1;

        originalSubtotal += product.originalPrice * qty;
        subtotal += product.price * qty;

        items.push({
            productId: product.productId,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            qty,
        });
    }

    return {
        items,
        originalSubtotal,
        itemDiscount: Math.max(0, originalSubtotal - subtotal),
        subtotal,
    };
}

/**
 * Validates a promo code against an already re-priced subtotal and an
 * optional user id (for per-user usage limits). Does NOT increment
 * timesUsed — callers should only do that after a payment is verified.
 *
 * @param {string} code
 * @param {number} subtotal
 * @param {string} [userId] - Mongo ObjectId string of the logged-in user
 */
async function validatePromoCode(code, subtotal, userId) {
    if (!code) return { promo: null, discountAmount: 0 };

    const promo = await PromoCode.findOne({ code: code.toUpperCase().trim() });

    if (!promo || !promo.active) {
        throw new HttpError(400, 'This promo code is not valid.');
    }

    const now = new Date();
    if (promo.validFrom && now < promo.validFrom) {
        throw new HttpError(400, 'This promo code is not active yet.');
    }
    if (promo.validUntil && now > promo.validUntil) {
        throw new HttpError(400, 'This promo code has expired.');
    }
    if (promo.maxTotalUses !== null && promo.timesUsed >= promo.maxTotalUses) {
        throw new HttpError(400, 'This promo code has reached its usage limit.');
    }
    if (subtotal < (promo.minOrderAmount || 0)) {
        throw new HttpError(
            400,
            `This code needs a minimum order of ₹${promo.minOrderAmount.toLocaleString('en-IN')}.`
        );
    }

    if (userId && promo.maxUsesPerUser) {
        const priorUses = await Order.countDocuments({
            user: userId,
            promoCode: promo.code,
            status: 'paid',
        });
        if (priorUses >= promo.maxUsesPerUser) {
            throw new HttpError(400, 'You have already used this promo code.');
        }
    }

    let discountAmount = 0;
    if (promo.discountType === 'flat') {
        discountAmount = promo.discountValue;
    } else if (promo.discountType === 'percent') {
        discountAmount = (subtotal * promo.discountValue) / 100;
        if (promo.maxDiscountAmount !== null) {
            discountAmount = Math.min(discountAmount, promo.maxDiscountAmount);
        }
    }

    discountAmount = Math.min(discountAmount, subtotal); // never discount below ₹0
    discountAmount = Math.round(discountAmount);

    return { promo, discountAmount };
}

module.exports = { repriceCart, validatePromoCode, HttpError };