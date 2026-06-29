
const API_BASE = window.MBA_API_BASE || 'https://mba-partner1.onrender.com';
const RAZORPAY_KEY_ID = window.MBA_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXX'; // public Key ID only — safe for frontend
const COMPANY_NAME = 'MBA Partner';
const COMPANY_THEME_COLOR = '#6366F1';

const { getCart, cartTotals, fmtINR, saveOrder, clearCart } = window.MBACart;

let activeMethod = 'card';
let appliedPromo = null; // { code, discountAmount, finalAmount } -- set only after server confirms

function selectTab(method) {
  activeMethod = method;
  document.querySelectorAll('.pay-tab').forEach(t => t.classList.toggle('active', t.dataset.method === method));
  document.querySelectorAll('.pay-method-panel').forEach(p => p.classList.toggle('active', p.dataset.method === method));
}

function validateForm() {
  let valid = true;
  const name = document.getElementById('fullName');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');

  const nameErr = document.getElementById('nameErr');
  const emailErr = document.getElementById('emailErr');
  const phoneErr = document.getElementById('phoneErr');

  nameErr.textContent = '';
  emailErr.textContent = '';
  phoneErr.textContent = '';

  if (!name.value.trim()) { nameErr.textContent = 'Enter your full name.'; valid = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { emailErr.textContent = 'Enter a valid email.'; valid = false; }
  if (!/^[6-9]\d{9}$/.test(phone.value.trim().replace(/\D/g, '').slice(-10))) { phoneErr.textContent = 'Enter a valid 10-digit mobile number.'; valid = false; }

  return valid;
}

/* ---------------- Promo code ---------------- */

async function applyPromoCode() {
  const input = document.getElementById('promoInput');
  const msg = document.getElementById('promoMsg');
  const code = input.value.trim().toUpperCase();

  msg.textContent = '';
  msg.className = 'promo-msg';

  if (!code) {
    msg.textContent = 'Enter a promo code first.';
    msg.classList.add('err');
    return;
  }

  const cart = getCart();
  if (!cart.length) return;

  const applyBtn = document.getElementById('promoApplyBtn');
  applyBtn.disabled = true;
  applyBtn.textContent = '...';

  try {
    const res = await fetch(`${API_BASE}/api/promo/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cart })
    });
    const data = await res.json();

    if (!res.ok || !data.valid) {
      appliedPromo = null;
      msg.textContent = data.message || 'That code is not valid.';
      msg.classList.add('err');
    } else {
      appliedPromo = { code, discountAmount: data.discountAmount, finalAmount: data.finalAmount };
      msg.textContent = `Code applied — you saved ${fmtINR(data.discountAmount)}.`;
      msg.classList.add('ok');
    }
  } catch (err) {
    appliedPromo = null;
    msg.textContent = 'Could not reach the server. Try again.';
    msg.classList.add('err');
  }

  applyBtn.disabled = false;
  applyBtn.textContent = 'Apply';
  renderSummaryTotals();
}

function removePromoCode() {
  appliedPromo = null;
  const input = document.getElementById('promoInput');
  const msg = document.getElementById('promoMsg');
  if (input) input.value = '';
  if (msg) { msg.textContent = ''; msg.className = 'promo-msg'; }
  renderSummaryTotals();
}

function renderSummaryTotals() {
  const cart = getCart();
  const totals = cartTotals(cart);
  const promoRow = document.getElementById('promoDiscountRow');
  const totalVal = document.getElementById('summaryTotalVal');

  if (appliedPromo) {
    promoRow.style.display = 'flex';
    promoRow.querySelector('.val').textContent = `− ${fmtINR(appliedPromo.discountAmount)}`;
    totalVal.textContent = fmtINR(appliedPromo.finalAmount);
  } else {
    promoRow.style.display = 'none';
    totalVal.textContent = fmtINR(totals.subtotal);
  }
}

/* ---------------- Payment ---------------- */

async function startPayment() {
  const token = localStorage.getItem('token');
  if (!validateForm()) return;

  const cart = getCart();
  if (!cart.length) return;

  const payBtn = document.getElementById('payBtn');
  payBtn.disabled = true;
  payBtn.textContent = 'Preparing payment…';

  const name = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();

  let orderId = null;
  let amountInPaise = null;

  // ---- Step 1: ask the backend to create a Razorpay order ----
  // The backend recomputes price + re-validates the promo code itself.
  // It does NOT trust any amount sent from this page.
  try {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/orders/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        cart,
        name,
        email,
        phone,
        promoCode: appliedPromo ? appliedPromo.code : null
      })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Could not create order.');
    }

    const data = await res.json();
    orderId = data.orderId;
    amountInPaise = data.amount; // backend-confirmed amount, in paise
  } catch (err) {
    alert(err.message || 'Could not start payment. Please try again in a moment.');
    payBtn.disabled = false;
    payBtn.textContent = '💳 Complete Payment';
    return;
  }

  payBtn.disabled = false;
  payBtn.textContent = '💳 Complete Payment';

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amountInPaise,
    currency: 'INR',
    name: COMPANY_NAME,
    description: `Order for ${cart.length} program${cart.length > 1 ? 's' : ''}`,
    image: '',
    order_id: orderId,
    prefill: { name, email, contact: phone },
    theme: { color: COMPANY_THEME_COLOR },
    method: {
      card: activeMethod === 'card',
      upi: activeMethod === 'upi',
      netbanking: activeMethod === 'netbanking',
      wallet: false,
      emi: false
    },
    handler: async function (response) {
      // ---- Step 2: send payment details to the backend for verification ----
      try {
        const verifyRes = await fetch(`${API_BASE}/api/orders/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        });

        if (!verifyRes.ok) {
          const errData = await verifyRes.json().catch(() => ({}));
          alert(errData.message || 'Payment verification failed. If money was deducted, contact support with your payment ID: ' + response.razorpay_payment_id);
          return;
        }

        const verified = await verifyRes.json();

        const order = {
          id: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          items: cart,
          totals: verified.totals,
          customer: { name, email, phone },
          createdAt: new Date().toISOString()
        };
        saveOrder(order);
        clearCart();
        window.location.href = 'order-success.html';
      } catch (err) {
        alert('Could not confirm payment with the server. If money was deducted, contact support with your payment ID: ' + response.razorpay_payment_id);
      }
    },
    modal: {
      ondismiss: function () {
        payBtn.disabled = false;
        payBtn.textContent = '💳 Complete Payment';
      }
    }
  };

  if (typeof Razorpay === 'undefined') {
    alert('Razorpay script failed to load. Check your internet connection and that checkout.razorpay.com is reachable.');
    return;
  }

  const rzp = new Razorpay(options);
  rzp.on('payment.failed', function (response) {
    alert('Payment failed: ' + (response.error && response.error.description ? response.error.description : 'Please try again.'));
  });
  rzp.open();
}

/* ---------------- Rendering ---------------- */

function renderEmpty() {
  document.getElementById('checkoutLayout').innerHTML = `
    <div class="empty-note" style="grid-column:1/-1;background:var(--paper-card);border:1px solid var(--rule);border-radius:16px;">
      Your cart is empty. <a href="mba-partner-courses-redesign.html" style="color:var(--primary);font-weight:700;">Browse courses</a> to add a program before checking out.
    </div>
  `;
}

function renderCheckout() {
  const cart = getCart();
  if (!cart.length) { renderEmpty(); return; }

  const totals = cartTotals(cart);
  const count = cart.reduce((s, i) => s + (i.qty || 1), 0);

  const itemsHtml = cart.map(i => `
    <div class="summary-item">
      <span>${i.name} <span class="qty">×${i.qty || 1}</span></span>
      <span class="price mono">${fmtINR(i.price * (i.qty || 1))}</span>
    </div>
  `).join('');

  document.getElementById('checkoutLayout').innerHTML = `
    <div class="pay-card">
      <div class="pay-tabs">
        <button type="button" class="pay-tab active" data-method="card" onclick="selectTab('card')">Card</button>
        <button type="button" class="pay-tab" data-method="upi" onclick="selectTab('upi')">UPI</button>
        <button type="button" class="pay-tab" data-method="netbanking" onclick="selectTab('netbanking')">Net Banking</button>
      </div>

      <div class="field-group">
        <label for="fullName">Full Name</label>
        <input id="fullName" type="text" placeholder="John Doe" autocomplete="name">
        <div class="err" id="nameErr"></div>
      </div>
      <div class="field-group">
        <label for="email">Email Address</label>
        <input id="email" type="email" placeholder="john@example.com" autocomplete="email">
        <div class="err" id="emailErr"></div>
      </div>
      <div class="field-group">
        <label for="phone">Phone Number</label>
        <input id="phone" type="tel" placeholder="+91 98765 43210" autocomplete="tel">
        <div class="err" id="phoneErr"></div>
      </div>

      <div class="pay-method-panel active" data-method="card">
        <div class="pay-note">
          💡 Card details are entered securely inside the Razorpay window that opens after you click <strong>Complete Payment</strong> — this page never sees or stores your card number.
        </div>
      </div>
      <div class="pay-method-panel" data-method="upi">
        <div class="upi-box">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="6" width="14" height="14" stroke="#6B7280" stroke-width="2" fill="none"/>
            <rect x="28" y="6" width="14" height="14" stroke="#6B7280" stroke-width="2" fill="none"/>
            <rect x="6" y="28" width="14" height="14" stroke="#6B7280" stroke-width="2" fill="none"/>
            <rect x="30" y="30" width="4" height="4" fill="#6B7280"/>
            <rect x="38" y="30" width="4" height="4" fill="#6B7280"/>
            <rect x="30" y="38" width="4" height="4" fill="#6B7280"/>
            <rect x="38" y="38" width="4" height="4" fill="#6B7280"/>
          </svg>
          <p>A UPI QR code and app list (Google Pay, PhonePe, Paytm…) will appear automatically inside the Razorpay window — generated for this exact order amount.</p>
        </div>
      </div>
      <div class="pay-method-panel" data-method="netbanking">
        <div class="netbanking-box">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 4 6 14v4h36v-4L24 4Z" stroke="#6B7280" stroke-width="2" fill="none"/>
            <path d="M10 18v18M18 18v18M30 18v18M38 18v18" stroke="#6B7280" stroke-width="2"/>
            <path d="M6 40h36" stroke="#6B7280" stroke-width="2"/>
          </svg>
          <p>You'll choose your bank from a full list inside the Razorpay window and log in there to complete payment.</p>
        </div>
      </div>

      <button type="button" class="btn btn-primary" id="payBtn" onclick="startPayment()">💳 Complete Payment</button>

      <div class="trust-row">
        <span class="item">🔒 256-bit SSL Encrypted</span>
        <span class="item">✅ PCI Compliant (via Razorpay)</span>
      </div>
    </div>

    <div class="summary-card">
      <h2>Order Summary</h2>
      <div class="summary-items">${itemsHtml}</div>
      <div class="summary-divider"></div>
      <div class="summary-row">
        <span>Subtotal (${count} ${count === 1 ? 'item' : 'items'})</span>
        <span class="val mono">${fmtINR(totals.originalSubtotal)}</span>
      </div>
      ${totals.savings > 0 ? `
      <div class="summary-row savings">
        <span>Discount</span>
        <span class="val mono">− ${fmtINR(totals.savings)}</span>
      </div>` : ''}

      <div class="promo-row">
        <input type="text" id="promoInput" class="promo-input" placeholder="Promo code">
        <button type="button" id="promoApplyBtn" class="promo-apply-btn" onclick="applyPromoCode()">Apply</button>
      </div>
      <div class="promo-msg" id="promoMsg"></div>

      <div class="summary-divider"></div>
      <div class="summary-row" id="promoDiscountRow" style="display:none">
        <span>Promo discount</span>
        <span class="val mono savings-text"></span>
      </div>
      <div class="summary-total">
        <span class="label">Total</span>
        <span class="val" id="summaryTotalVal">${fmtINR(totals.subtotal)}</span>
      </div>
    </div>
  `;
}

renderCheckout();
