// scripts/seedDashboard.js
//
// Populates one existing user's dashboard with demo data: Section Strength,
// GDPI checklist, and an activity feed. Percentile, Recent Mock Tests, and
// the 365-day streak heatmap are intentionally left at zero/empty — wire
// those up via real POST /api/dashboard/mocks calls or your own data.
//
// Usage (run from anywhere — path below is resolved relative to this file,
// not your current working directory):
//   node scripts/seedDashboard.js you@example.com
//   (or, from inside scripts/:  node seedDashboard.js you@example.com)
//
// Looks up the user by email (must already exist — register/login once
// first), then creates/refreshes their DashboardSummary, SectionStrength,
// MockTest, GdpiChecklistItem, ActivityFeedItem and StreakDay documents.

const path = require('path');
// Resolve .env relative to this file (../.env = backend/.env), so this
// script finds it whether you run it from backend/ or backend/scripts/.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const DashboardSummary = require('../models/DashboardSummary');
const SectionStrength = require('../models/SectionStrength');
const MockTest = require('../models/MockTest');
const GdpiChecklistItem = require('../models/GdpiChecklistItem');
const ActivityFeedItem = require('../models/ActivityFeedItem');
const StreakDay = require('../models/StreakDay');
const { recomputeStreakCounters } = require('../utils/streak');

async function seed() {
    const email = process.argv[2];
    if (!email) {
        console.error('Usage: node scripts/seedDashboard.js <user-email>');
        process.exit(1);
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
        console.error(`No user found with email "${email}". Register/login once first.`);
        process.exit(1);
    }

    const userId = user._id;

    // ---- Clear any existing dashboard data for this user (idempotent re-seed) ----
    await Promise.all([
        SectionStrength.deleteMany({ user: userId }),
        MockTest.deleteMany({ user: userId }),
        GdpiChecklistItem.deleteMany({ user: userId }),
        ActivityFeedItem.deleteMany({ user: userId }),
        StreakDay.deleteMany({ user: userId }),
    ]);

    // ---- Section strength ----
    await SectionStrength.insertMany([
        { user: userId, sectionName: 'QA', accuracyPct: 0 },
        { user: userId, sectionName: 'LRDI', accuracyPct: 0 },
        { user: userId, sectionName: 'VARC', accuracyPct: 0 },
    ]);

    // ---- Mock tests: intentionally none — percentile ring and the
    //      Recent Mock Tests table should both start at zero/empty. ----

    // ---- GDPI checklist ----
    await GdpiChecklistItem.insertMany([
        // --- Profile & Documentation ---
        { user: userId, groupName: 'Profile & Documentation', groupOrder: 1, sortOrder: 1, itemText: 'Profile summary reviewed', isDone: true },
        { user: userId, groupName: 'Profile & Documentation', groupOrder: 1, sortOrder: 2, itemText: 'Resume/CV finalized for B-school format', isDone: false, metaLabel: 'Pending' },
        { user: userId, groupName: 'Profile & Documentation', groupOrder: 1, sortOrder: 3, itemText: 'Statement of Purpose (SOP) drafted', isDone: false, metaLabel: 'Pending' },
        { user: userId, groupName: 'Profile & Documentation', groupOrder: 1, sortOrder: 4, itemText: 'Work experience talking points prepared', isDone: false, metaLabel: 'Pending' },
        { user: userId, groupName: 'Profile & Documentation', groupOrder: 1, sortOrder: 5, itemText: 'Academic gaps/discrepancies explained (if any)', isDone: false, metaLabel: 'Pending' },

        // --- Written Ability Test (WAT) ---
        { user: userId, groupName: 'Written Ability Test (WAT)', groupOrder: 2, sortOrder: 1, itemText: 'WAT practice set 1 completed', isDone: true },
        { user: userId, groupName: 'Written Ability Test (WAT)', groupOrder: 2, sortOrder: 2, itemText: 'WAT practice set 2 completed', isDone: false, metaLabel: 'In review' },
        { user: userId, groupName: 'Written Ability Test (WAT)', groupOrder: 2, sortOrder: 3, itemText: 'WAT practice set 3 completed', isDone: false, metaLabel: 'Pending' },
        { user: userId, groupName: 'Written Ability Test (WAT)', groupOrder: 2, sortOrder: 4, itemText: 'Current affairs reading log started', isDone: false, metaLabel: 'Pending' },

        // --- Group Discussion (GD) ---
        { user: userId, groupName: 'Group Discussion (GD)', groupOrder: 3, sortOrder: 1, itemText: '1st mock GD completed', isDone: true },
        { user: userId, groupName: 'Group Discussion (GD)', groupOrder: 3, sortOrder: 2, itemText: '2nd mock GD completed', isDone: false, metaLabel: 'Book slot' },
        { user: userId, groupName: 'Group Discussion (GD)', groupOrder: 3, sortOrder: 3, itemText: 'GD body language & listening feedback reviewed', isDone: false, metaLabel: 'Pending' },

        // --- Personal Interview (PI) ---
        { user: userId, groupName: 'Personal Interview (PI)', groupOrder: 4, sortOrder: 1, itemText: '"Tell me about yourself" pitch rehearsed', isDone: false, metaLabel: 'Pending' },
        { user: userId, groupName: 'Personal Interview (PI)', groupOrder: 4, sortOrder: 2, itemText: 'Why MBA / why this school answered', isDone: false, metaLabel: 'Pending' },
        { user: userId, groupName: 'Personal Interview (PI)', groupOrder: 4, sortOrder: 3, itemText: 'Mock Personal Interview #1 completed', isDone: false, metaLabel: 'Book slot' },
        { user: userId, groupName: 'Personal Interview (PI)', groupOrder: 4, sortOrder: 4, itemText: 'Mock Personal Interview #2 completed', isDone: false, metaLabel: 'Pending' },
        { user: userId, groupName: 'Personal Interview (PI)', groupOrder: 4, sortOrder: 5, itemText: 'Common HR + technical questions reviewed', isDone: false, metaLabel: 'Pending' },
        { user: userId, groupName: 'Personal Interview (PI)', groupOrder: 4, sortOrder: 6, itemText: 'Mentor feedback from last mock PI actioned', isDone: false, metaLabel: 'Pending' },

        // --- Final Prep ---
        { user: userId, groupName: 'Final Prep', groupOrder: 5, sortOrder: 1, itemText: 'Latest current affairs / company GK refreshed', isDone: false, metaLabel: 'Pending' },
        { user: userId, groupName: 'Final Prep', groupOrder: 5, sortOrder: 2, itemText: 'Interview day logistics confirmed (venue, documents, dress)', isDone: false, metaLabel: 'Pending' },
    ]);

    // ---- Activity feed ----
    const daysAgo = (n) => {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() - n);
        return d;
    };
    await ActivityFeedItem.insertMany([
        { user: userId, icon: '🎯', message: 'Completed LRDI Sectional Drill — Set 9, scored 7/8', createdAt: daysAgo(0) },
        { user: userId, icon: '🗣️', message: 'Mentor feedback received on Mock GD #2', createdAt: daysAgo(1) },
        { user: userId, icon: '📝', message: 'Submitted WAT Practice Set 2 for review', createdAt: daysAgo(2) },
        { user: userId, icon: '🏆', message: 'Account set up — your prep journey starts here', createdAt: daysAgo(6) },
    ]);

    // ---- Streak days: intentionally none — the 365-day heatmap should
    //      start fully empty (current/longest streak = 0). ----
    const { currentStreak, longestStreak } = await recomputeStreakCounters(userId);

    // ---- Headline summary: percentile/mocks/accuracy reset to zero;
    //      cohort rank/size left as illustrative placeholders. ----
    await DashboardSummary.findOneAndUpdate(
        { user: userId },
        {
            overallPercentile: 0,
            percentileDelta: 0,
            cohortRank: 47,
            cohortSize: 1204,
            currentStreak,
            longestStreak,
            mocksAttempted: 0,
            avgAccuracy: 0,
        },
        { upsert: true }
    );

    console.log(`Dashboard demo data seeded for ${user.email} (currentStreak=${currentStreak}, longestStreak=${longestStreak}).`);
    await mongoose.connection.close();
    process.exit(0);
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
