const mongoose = require('mongoose');

const GdpiChecklistItemSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        itemText: {
            type: String,
            required: true,
            trim: true,
        },
        // Section header this item is displayed under on the dashboard,
        // e.g. 'Profile & Documentation', 'Written Ability Test (WAT)',
        // 'Group Discussion (GD)', 'Personal Interview (PI)', 'Final Prep'.
        groupName: {
            type: String,
            trim: true,
            default: 'General',
        },
        // Controls the order groups appear in, independent of groupName's
        // alphabetical order (e.g. 'Final Prep' should sort last, not first).
        groupOrder: {
            type: Number,
            default: 0,
        },
        isDone: {
            type: Boolean,
            default: false,
        },
        metaLabel: {
            type: String,
            trim: true,
            default: null,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

GdpiChecklistItemSchema.index({ user: 1, groupOrder: 1, sortOrder: 1 });

module.exports = mongoose.model('GdpiChecklistItem', GdpiChecklistItemSchema);
