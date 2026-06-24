const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Shared cookie options for the JWT
const cookieOptions = (remember) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 30d vs 1d
});

// @route  POST /api/auth/register
// @desc   Create a new account
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password });

    const token = generateToken(user._id, false);
    res.cookie('auth_token', token, cookieOptions(false));

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/login
// @desc   Authenticate a user and issue a JWT
const login = async (req, res, next) => {
  try {
    const { email, password, remember } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter your password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password +loginAttempts +lockUntil'
    );

    // Generic message on purpose — don't reveal whether the email exists
    const invalidMsg = 'Invalid email or password';

    if (!user) {
      return res.status(401).json({ success: false, message: invalidMsg });
    }

    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
        user.loginAttempts = 0;
      }
      await user.save();
      return res.status(401).json({ success: false, message: invalidMsg });
    }

    // Successful login — reset attempt counter
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const token = generateToken(user._id, !!remember);
    res.cookie('auth_token', token, cookieOptions(!!remember));

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('auth_token');
  res.status(200).json({ success: true, message: 'Logged out' });
};

// @route  GET /api/auth/me
// @desc   Return the currently authenticated user (requires `protect` middleware)
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: { id: req.user._id, name: req.user.name, email: req.user.email },
  });
};

// @route  POST /api/auth/forgot-password
// @desc   Generate a reset token for the given email. Wire this up to a real email
//         provider (SendGrid, SES, Nodemailer + SMTP, etc.) in production.
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return the same response, whether or not the account exists,
    // so this endpoint can't be used to enumerate registered emails.
    const genericResponse = {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // TODO: send `resetUrl` via your email provider instead of logging it.
    console.log(`Password reset requested for ${user.email}: ${resetUrl}`);

    const payload = { ...genericResponse };
    if (process.env.NODE_ENV !== 'production') {
      // Only exposed in non-production so you can test the flow without an email service
      payload.devResetUrl = resetUrl;
    }

    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/reset-password/:token
// @desc   Set a new password using a valid, unexpired reset token
const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword };
