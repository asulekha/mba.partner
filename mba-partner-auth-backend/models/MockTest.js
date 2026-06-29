const mongoose = require('mongoose');

const MockTestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        examTag: {
            type: String,
            required: true,
            enum: ['CAT', 'XAT', 'SNAP', 'NMAT', 'CMAT', 'IIFT'],
        },
        testName: {
            type: String,
            required: true,
            trim: true,
        },
        // Stored as a real Date (unlike StreakDay) since these are
        // discrete logged events, sorted and displayed, not bucketed by day.
        testDate: {
            type: Date,
            required: true,
        },
        scoreRaw: {
            type: Number,
            required: true,
        },
        scoreMax: {
            type: Number,
            required: true,
        },
        percentile: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        percentileDelta: {
            type: Number,
            default: 0,
        },
        // Optional per-section breakdown for this attempt, e.g.
        // [{ name: 'VARC', accuracyPct: 88 }, ...]. When present,
        // dashboardController rolls these into SectionStrength.
        sections: [
            {
                name: { type: String, trim: true },
                accuracyPct: { type: Number, min: 0, max: 100 },
            },
        ],
    },
    { timestamps: true }
);

MockTestSchema.index({ user: 1, testDate: -1 });

module.exports = mongoose.model('MockTest', MockTestSchema);
