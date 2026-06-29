const mongoose = require('mongoose');

// One document per user per day they did *something* countable toward
// the prep streak. sessionCount drives the heatmap cell's color intensity
// (no row for a date = 0 sessions that day = empty cell).
const StreakDaySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Stored as 'YYYY-MM-DD' (not a Date) so "one row per calendar day"
        // is a plain string comparison/unique-index, with no timezone
        // ambiguity from truncating a Date to midnight.
        activityDate: {
            type: String,
            required: true,
            match: /^\d{4}-\d{2}-\d{2}$/,
        },
        sessionCount: {
            type: Number,
            default: 1,
            min: 0,
        },
    },
    { timestamps: true }
);

StreakDaySchema.index({ user: 1, activityDate: 1 }, { unique: true });

module.exports = mongoose.model('StreakDay', StreakDaySchema);
