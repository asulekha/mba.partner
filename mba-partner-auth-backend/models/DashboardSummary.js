const mongoose = require('mongoose');

// One document per user. Holds the numbers the dashboard's percentile ring,
// streak chip, and mini-stat rows read directly — recomputed by
// controllers/dashboardController.js whenever a new MockTest or
// StreakDay is written, so reads here never have to aggregate on the fly.
const DashboardSummarySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        overallPercentile: {
            type: Number,
            default: 0,
        },
        percentileDelta: {
            type: Number,
            default: 0,
        },
        cohortRank: {
            type: Number,
            default: 0,
        },
        cohortSize: {
            type: Number,
            default: 0,
        },
        currentStreak: {
            type: Number,
            default: 0,
        },
        longestStreak: {
            type: Number,
            default: 0,
        },
        mocksAttempted: {
            type: Number,
            default: 0,
        },
        avgAccuracy: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('DashboardSummary', DashboardSummarySchema);
