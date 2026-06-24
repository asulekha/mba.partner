const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protects routes — requires a valid JWT in the Authorization header or auth_token cookie
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  console.log('====================================');
  console.log('AUTH HEADER:', authHeader);
  console.log('COOKIE:', req.cookies);
  console.log('====================================');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('DECODED TOKEN:', decoded);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user no longer exists'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log('JWT ERROR:', err.message);

    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid or expired'
    });
  }
};

module.exports = { protect };