# MBA Partner — Auth Backend

Express + MongoDB backend for the login page (`login.html`). Provides
registration, login, logout, "forgot password" / reset, and a protected
"current user" endpoint.

## Setup

```bash
npm install
cp .env.example .env   # then fill in MONGO_URI, JWT_SECRET, CLIENT_ORIGIN
npm run dev             # or: npm start
```

Requires a running MongoDB instance (local `mongod`, or a connection string
from MongoDB Atlas) referenced by `MONGO_URI`.

## Project structure

```
mba-partner-auth-backend/
├─ server.js                 # app entry point
├─ config/db.js              # mongoose connection
├─ models/User.js            # User schema (hashed password, reset token)
├─ controllers/authController.js
├─ routes/authRoutes.js
├─ middleware/authMiddleware.js   # JWT verification ("protect")
├─ middleware/errorHandler.js
└─ utils/generateToken.js
```

## API reference

All responses are JSON: `{ success: boolean, message?, ...data }`.

| Method | Endpoint                          | Auth | Body |
|--------|-----------------------------------|------|------|
| POST   | `/api/auth/register`              | No   | `{ name, email, password }` |
| POST   | `/api/auth/login`                 | No   | `{ email, password, remember }` |
| POST   | `/api/auth/logout`                | No   | — |
| GET    | `/api/auth/me`                    | Yes  | — |
| POST   | `/api/auth/forgot-password`       | No   | `{ email }` |
| POST   | `/api/auth/reset-password/:token` | No   | `{ password }` |

Auth is accepted either as `Authorization: Bearer <token>` or via the
`auth_token` httpOnly cookie that login/register set automatically.

Notes:
- Passwords are hashed with bcrypt (never stored or returned in plaintext).
- Accounts lock for 15 minutes after 5 failed login attempts.
- `forgot-password` always returns the same generic message, whether or not
  the email is registered, so it can't be used to enumerate accounts. In
  non-production mode the response also includes `devResetUrl` so you can
  test the flow without wiring up a real email provider — replace the
  `console.log` in `controllers/authController.js` with a call to
  SendGrid/SES/Nodemailer in production.
- `login`, `register`, and password-reset endpoints are rate-limited
  (20 requests / 15 min per IP).

## Wiring up `login.html`

Replace the simulated `setTimeout` block in the page's script with a real
call to the API:

```javascript
const API_BASE = 'http://localhost:5000/api/auth';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  // ...existing validation above stays the same...
  if (!valid) return;

  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in…';

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // so the auth_token cookie is stored
      body: JSON.stringify({
        email: emailInput.value.trim(),
        password: pwInput.value,
        remember: document.getElementById('remember').checked,
      }),
    });
    const data = await res.json();

    if (!data.success) {
      errorText.textContent = data.message;
      errorAlert.classList.add('show');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Log In →';
      return;
    }

    localStorage.setItem('token', data.token); // optional, if not relying on the cookie
    successAlert.classList.add('show');
    setTimeout(() => { window.location.href = 'index.html'; }, 900);
  } catch (err) {
    errorText.textContent = 'Network error — please try again.';
    errorAlert.classList.add('show');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Log In →';
  }
});
```

## Production checklist

- Set a strong, random `JWT_SECRET`.
- Set `NODE_ENV=production` (enables `secure` cookies and hides `devResetUrl`).
- Connect a real email provider for password resets.
- Put the API behind HTTPS; the `CLIENT_ORIGIN` CORS setting should match
  your deployed frontend's exact origin.
# Adding Orders + Promo Codes to your existing Auth Backend

This does NOT replace your auth backend. It's an *addition* — drop these
files into your existing project (same folder names you already have:
`config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `utils/`)
and update two files (`server.js`, `package.json`) as shown below.

## 1. Install the one new dependency

```bash
npm install razorpay
```

Everything else (`express-rate-limit`, `mongoose`, `cookie-parser`, etc.)
is already in your `package.json` — nothing else to install.

## 2. Copy these new files in

```
your-project/
├── config/
│   └── razorpay.js          ← NEW
├── controllers/
│   ├── authController.js     (yours, unchanged)
│   ├── orderController.js   ← NEW
│   └── promoController.js   ← NEW
├── middleware/
│   ├── authMiddleware.js     (yours, unchanged — reused as-is)
│   └── errorHandler.js       (yours, unchanged)
├── models/
│   ├── User.js                (yours, unchanged)
│   ├── Order.js              ← NEW
│   ├── Product.js            ← NEW
│   └── PromoCode.js          ← NEW
├── routes/
│   ├── authRoutes.js          (yours, unchanged)
│   ├── orderRoutes.js        ← NEW
│   └── promoRoutes.js        ← NEW
├── scripts/
│   ├── seedProducts.js       ← NEW
│   └── seedPromoCodes.js     ← NEW
├── utils/
│   ├── generateToken.js       (yours, unchanged)
│   └── pricing.js            ← NEW
├── server.js                 ← REPLACE with the version here (only 3 lines added)
└── package.json               ← UPDATE (added "razorpay" + 2 seed scripts)
```

## 3. Add to your `.env`

Your existing `.env` keeps `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
`JWT_REMEMBER_EXPIRES_IN`, `CLIENT_ORIGIN`, `NODE_ENV`, `PORT` exactly as
they are. Just append what's in `.env.additions.example`:

```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

Get real values from [dashboard.razorpay.com/app/keys](https://dashboard.razorpay.com/app/keys). The Key Secret must never be sent to the frontend or committed to git.

## 4. Seed sample data, then start

```bash
node scripts/seedProducts.js     # edit productId values first — see note below
node scripts/seedPromoCodes.js
npm run dev
```

**Important:** open `scripts/seedProducts.js` and make sure each
`productId` matches the real `id` your `cart.js` stores for cart items
(the same id used in `addToCart({...})` on your product pages). The
backend prices every order strictly off this catalog and will reject any
cart item it doesn't recognize.

## What's new, in plain terms

- **`GET/POST /api/orders/*`, `POST /api/promo/validate`** are now
  **protected routes** — they require the same `auth_token` cookie your
  login already sets. This reuses your existing `protect` middleware
  unchanged. A logged-out visitor trying to apply a promo code or check
  out gets redirected to your login page automatically (the frontend
  already handles this — see below).
- **Prices are never trusted from the browser.** `utils/pricing.js`
  re-prices every cart against the `Product` collection, and re-checks
  every promo code against the `PromoCode` collection, every time —
  once when validating, and again right before creating the Razorpay
  order, so nothing in between can be tampered with.
- **Payments are verified, not assumed.** `orderController.verifyPayment`
  recomputes Razorpay's HMAC SHA256 signature using your Key Secret
  before marking an order `paid`. The frontend popup completing is never
  treated as proof of payment on its own.
- **Promo usage limits are per-user**, tracked via `req.user._id` (the
  same user object your `protect` middleware already attaches), counted
  only after a payment is verified — so an abandoned checkout doesn't
  burn a use.
- Added `GET /api/orders/my-orders` as a bonus — lists the logged-in
  user's paid orders, in case you want an order-history page later.

## Frontend changes already made (separate from this backend drop-in)

The `cart-page.html` and `checkout.js` files from earlier in this
conversation already call these endpoints with
`credentials: 'include'`, so the `auth_token` cookie is sent
automatically. If you're copying this backend onto a fresh checkout that
*doesn't* have those updates yet, every `fetch()` call to
`/api/orders/*` or `/api/promo/validate` needs `credentials: 'include'`
added, or the cookie won't be sent and `protect` will always reject the
request as unauthenticated.

## Sample promo codes (from `seedPromoCodes.js`)

| Code         | Discount                  | Minimum order |
|--------------|----------------------------|----------------|
| `WELCOME500` | Flat ₹500 off              | None           |
| `MBA10`      | 10% off, capped at ₹2,000  | ₹5,000         |
| `ALUMNI20`   | 20% off, capped at ₹3,000  | ₹10,000        |