(function () {
    const CART_KEY = 'mbaPartnerCart';
    const ORDER_KEY = 'mbaPartnerLastOrder';
    const TOKEN_KEY = 'token';
    const LOGIN_PAGE = 'mba-partner-login.html';

    // ---------- Per-user namespacing ----------
    // The JWT payload (the part between the two dots) contains the user's id.
    // We don't need to verify the signature here — just read the id so each
    // account gets its own cart/order storage instead of sharing one global key.
    function getUserId() {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload && payload.id ? payload.id : null;
        } catch (e) {
            return null; // malformed/expired token — treat as guest
        }
    }
    function cartKey() {
        const uid = getUserId();
        return uid ? `${CART_KEY}:${uid}` : `${CART_KEY}:guest`;
    }
    function orderKey() {
        const uid = getUserId();
        return uid ? `${ORDER_KEY}:${uid}` : `${ORDER_KEY}:guest`;
    }

    function getCart() {
        try {
            const raw = localStorage.getItem(cartKey());
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    function saveCart(cart) {
        try {
            localStorage.setItem(cartKey(), JSON.stringify(cart));
        } catch (e) { /* storage unavailable */ }
    }
    function isLoggedIn() {
        return !!localStorage.getItem(TOKEN_KEY);
    }
    function goToLogin(returnTo) {
        const next = encodeURIComponent(returnTo || window.location.pathname);
        window.location.href = `${LOGIN_PAGE}?next=${next}`;
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
    // Gate cart additions behind login. If the visitor isn't signed in, they're sent
    // to the login page (with a `next` param) instead of the item being added.
    function addToCartAndGo(item, destination) {
        if (!isLoggedIn()) {
            goToLogin(destination || 'cart-page.html');
            return;
        }
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
            localStorage.setItem(orderKey(), JSON.stringify(order));
        } catch (e) { /* storage unavailable */ }
    }
    function getLastOrder() {
        try {
            const raw = localStorage.getItem(orderKey());
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
        cartCount, cartTotals, saveOrder, getLastOrder, fmtINR, genOrderId,
        isLoggedIn, goToLogin
    };
    // Shorthand used directly by inline onclick handlers on product pages
    window.addToCartAndGo = addToCartAndGo;
})();