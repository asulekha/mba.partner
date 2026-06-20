
(function () {
    const CART_KEY = 'mbaPartnerCart';
    const ORDER_KEY = 'mbaPartnerLastOrder';
    function getCart() {
        try {
            const raw = localStorage.getItem(CART_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    function saveCart(cart) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (e) { /* storage unavailable */ }
    }
    function addToCart(item) {
        const cart = getCart();
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
            existing.qty = (existing.qty || 1) + 1;
        } else {
            cart.push(Object.assign({ qty: 1 }, item));
        }
        saveCart(cart);
        return cart;
    }
    function addToCartAndGo(item, destination) {
        addToCart(item);
        window.location.href = destination || 'cart-page.html';
    }
    function setCart(cart) {
        saveCart(cart);
    }
    function clearCart() {
        saveCart([]);
    }
    function cartCount() {
        return getCart().reduce((sum, i) => sum + (i.qty || 1), 0);
    }
    function cartTotals(cart) {
        const items = cart || getCart();
        let subtotal = 0, originalSubtotal = 0;
        items.forEach(i => {
            const qty = i.qty || 1;
            subtotal += i.price * qty;
            originalSubtotal += (i.originalPrice || i.price) * qty;
        });
        return {
            subtotal,
            originalSubtotal,
            savings: Math.max(0, originalSubtotal - subtotal)
        };
    }
    function saveOrder(order) {
        try {
            localStorage.setItem(ORDER_KEY, JSON.stringify(order));
        } catch (e) { /* storage unavailable */ }
    }
    function getLastOrder() {
        try {
            const raw = localStorage.getItem(ORDER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }
    function fmtINR(n) {
        return '₹' + Math.round(n).toLocaleString('en-IN');
    }
    function genOrderId() {
        const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
        return 'MBP-' + Date.now().toString().slice(-6) + rand;
    }
    // Expose globally
    window.MBACart = {
        getCart, saveCart, addToCart, addToCartAndGo, setCart, clearCart,
        cartCount, cartTotals, saveOrder, getLastOrder, fmtINR, genOrderId
    };
    // Shorthand used directly by inline onclick handlers on product pages
    window.addToCartAndGo = addToCartAndGo;
})();
