const mongoose = require('mongoose');

// One document per (user, section) pair — e.g. a user has up to one
// 'VARC' row, one 'QA' row, one 'LRDI' row. Updated by
// dashboardController.recordMockTest whenever a new mock includes a
// sectional breakdown.
const SectionStrengthSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sectionName: {
            type: String,
            required: true,
            trim: true,
        },
        accuracyPct: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
    },
    { timestamps: true }
);

SectionStrengthSchema.index({ user: 1, sectionName: 1 }, { unique: true });

module.exports = mongoose.model('SectionStrength', SectionStrengthSchema);
