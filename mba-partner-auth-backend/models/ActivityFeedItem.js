const mongoose = require('mongoose');

const ActivityFeedItemSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        icon: {
            type: String,
            default: '📌',
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true } // createdAt doubles as "occurredAt"
);

ActivityFeedItemSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityFeedItem', ActivityFeedItemSchema);
