/*
  Run with: node scripts/seedPromoCodes.js
  Inserts a few sample promo codes so you have something to test the
  checkout flow with immediately. Edit freely or add your own.
*/
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const PromoCode = require('../models/PromoCode');

const samplePromoCodes = [
    {
        code: 'WELCOME500',
        description: 'Flat ₹500 off for new students',
        discountType: 'flat',
        discountValue: 500,
        minOrderAmount: 0,
        maxTotalUses: null,
        maxUsesPerUser: 1,
    },
    {
        code: 'MBA10',
        description: '10% off, capped at ₹2000',
        discountType: 'percent',
        discountValue: 10,
        maxDiscountAmount: 2000,
        minOrderAmount: 5000,
        maxTotalUses: 500,
        maxUsesPerUser: 1,
    },
    {
        code: 'ALUMNI20',
        description: '20% off for alumni referrals, capped at ₹3000',
        discountType: 'percent',
        discountValue: 20,
        maxDiscountAmount: 3000,
        minOrderAmount: 10000,
        maxTotalUses: null,
        maxUsesPerUser: 1,
    },
];

(async () => {
    await connectDB();

    for (const promo of samplePromoCodes) {
        await PromoCode.findOneAndUpdate({ code: promo.code }, { $set: promo }, { upsert: true, new: true });
        console.log(`Upserted promo code: ${promo.code}`);
    }

    await mongoose.disconnect();
    console.log('Done.');
})().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});