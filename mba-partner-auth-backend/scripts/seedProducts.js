/*
  Run with: node scripts/seedProducts.js

  IMPORTANT: productId here must match the "id" field your frontend
  cart.js stores for each cart item (the same id used in addToCart()).
  Update productId below to match your actual product ids before running.
*/
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

const sampleProducts = [
    {
        productId: 'Placements Bootcamp + Case Comp + 1 Live Project',
        name: 'Placements Bootcamp + Case Comp + 1 Live Project',
        price: 13999,
        originalPrice: 14500,
    },
    {
        productId: 'All-in-One Combo',
        name: 'All-in-One Combo',
        price: 14999,
        originalPrice: 17999,
    },
    {
        productId: 'Any 1 Domain',
        name: 'Any 1 Domain',
        price: 4999,
        originalPrice: 5999,
    },
    {
        productId: 'Any 2 Domains',
        name: 'Any 2 Domains',
        price: 8499,
        originalPrice: 9999,
    },
    {
        productId: 'Bootcamp + Case Comp',
        name: 'Bootcamp + Case Comp',
        price: 10499,
        originalPrice: 11500,
    },
    {
        productId: 'Bootcamp + Live Project',
        name: 'Bootcamp + Live Project',
        price: 10999,
        originalPrice: 12500,
    },
    {
        productId: 'Bootcamp + 1 Live Project',
        name: 'Placements Bootcamp +1 Live Project',
        price: 11499,
        originalPrice: 11999,
    },
    {
        productId: 'Case Comp + Live Project',
        name: 'Case Comp + Live Project',
        price: 9999,
        originalPrice: 11200,
    },
    {
        productId: 'Case Competition',
        name: 'Case Competition',
        price: 6499,
        originalPrice: 7499,
    },
    {
        productId: 'Placements Bootcamp + Case Comp',
        name: 'Placements Bootcamp + Case Comp',
        price: 10499,
        originalPrice: 11500,
    },
    {
        productId: 'Power BI Certificate',
        name: 'Power BI Certificate',
        price: 2999,
        originalPrice: 3999,
    },
];

(async () => {
    await connectDB();

    for (const product of sampleProducts) {
        await Product.findOneAndUpdate(
            { productId: product.productId },
            { $set: product },
            { upsert: true, new: true }
        );
        console.log(`Upserted product: ${product.productId}`);
    }

    await mongoose.disconnect();
    console.log('Done.');
})().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});