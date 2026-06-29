const Order = require('../models/Order');

// @route  GET /api/orders/my-courses
// @desc   Return the courses the logged-in user has purchased (requires `protect`)
const getMyCourses = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id, status: 'paid' }).sort({ createdAt: -1 });

    const courses = orders.map((o) => ({
      orderId: o._id,
      courseSlug: o.courseSlug,
      courseName: o.courseName,
      amount: o.amount,
      currency: o.currency,
      purchasedAt: o.createdAt,
    }));

    res.status(200).json({ success: true, courses });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/orders/record
// @desc   Record a completed purchase for the logged-in user.
//
//         IMPORTANT: this is a starting-point stub. It does NOT verify a Razorpay
//         payment signature — it just writes whatever it's told. Call it from
//         inside your real payment-verification handler (after you've confirmed
//         the Razorpay signature/webhook is valid), not directly from the
//         frontend, or anyone logged in could grant themselves a free course.
const recordPurchase = async (req, res, next) => {
  try {
    const { courseSlug, courseName, amount, currency, paymentId } = req.body;

    if (!courseSlug || !courseName || !amount) {
      return res
        .status(400)
        .json({ success: false, message: 'courseSlug, courseName and amount are required' });
    }

    const order = await Order.create({
      user: req.user._id,
      courseSlug,
      courseName,
      amount,
      currency: currency || 'INR',
      paymentId,
      status: 'paid',
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyCourses, recordPurchase };
