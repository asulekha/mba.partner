const StreakDay = require('../models/StreakDay');
const DashboardSummary = require('../models/DashboardSummary');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const toDateString = (d) => d.toISOString().slice(0, 10);

/**
 * Recomputes currentStreak and longestStreak for a user from their
 * StreakDay rows, and writes the result onto DashboardSummary.
 * Call this after any write to StreakDay (a check-in, or a new
 * MockTest, which also counts as a check-in for that day).
 *
 * @param {string} userId - Mongo ObjectId string
 */
async function recomputeStreakCounters(userId) {
    const rows = await StreakDay.find({ user: userId, sessionCount: { $gt: 0 } })
        .sort({ activityDate: 1 })
        .select('activityDate')
        .lean();

    const dateSet = new Set(rows.map((r) => r.activityDate));

    // Longest streak: scan every known active day for the longest
    // consecutive run.
    let longest = 0;
    let run = 0;
    let prevDate = null;
    for (const row of rows) {
        const current = new Date(`${row.activityDate}T00:00:00Z`);
        if (prevDate) {
            const diffDays = Math.round((current - prevDate) / ONE_DAY_MS);
            run = diffDays === 1 ? run + 1 : 1;
        } else {
            run = 1;
        }
        longest = Math.max(longest, run);
        prevDate = current;
    }

    // Current streak: walk backward from today. If today has no entry
    // yet, start from yesterday instead so an in-progress day doesn't
    // wrongly zero out yesterday's streak.
    let currentStreak = 0;
    const cursor = new Date();
    if (!dateSet.has(toDateString(cursor))) {
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    while (dateSet.has(toDateString(cursor))) {
        currentStreak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    await DashboardSummary.findOneAndUpdate(
        { user: userId },
        { currentStreak, longestStreak: longest },
        { upsert: true }
    );

    return { currentStreak, longestStreak: longest };
}

/**
 * Records one prep session for "today" for a user — bumps sessionCount
 * on today's StreakDay row (creating it if needed), then recomputes
 * streak counters. Safe to call multiple times per day.
 *
 * @param {string} userId
 */
async function checkInToday(userId) {
    const today = toDateString(new Date());

    await StreakDay.findOneAndUpdate(
        { user: userId, activityDate: today },
        { $inc: { sessionCount: 1 } },
        { upsert: true }
    );

    return recomputeStreakCounters(userId);
}

module.exports = { recomputeStreakCounters, checkInToday, toDateString };
