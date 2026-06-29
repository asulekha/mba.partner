const DashboardSummary = require('../models/DashboardSummary');
const StreakDay = require('../models/StreakDay');
const SectionStrength = require('../models/SectionStrength');
const MockTest = require('../models/MockTest');
const GdpiChecklistItem = require('../models/GdpiChecklistItem');
const ActivityFeedItem = require('../models/ActivityFeedItem');
const { recomputeStreakCounters, checkInToday, toDateString } = require('../utils/streak');

// ---------------------------------------------------------------------
// @route  GET /api/dashboard/summary
// @desc   Percentile ring, streak/rank chips, mini-stat rows. Requires `protect`.
// ---------------------------------------------------------------------
const getSummary = async (req, res, next) => {
    try {
        const summary = await DashboardSummary.findOne({ user: req.user._id }).lean();

        const sections = await SectionStrength.find({ user: req.user._id })
            .sort({ accuracyPct: 1 })
            .lean();

        const weakest = sections[0] || null;
        const strongest = sections[sections.length - 1] || null;

        res.status(200).json({
            success: true,
            summary: {
                overallPercentile: summary?.overallPercentile ?? 0,
                percentileDelta: summary?.percentileDelta ?? 0,
                cohortRank: summary?.cohortRank ?? 0,
                cohortSize: summary?.cohortSize ?? 0,
                currentStreak: summary?.currentStreak ?? 0,
                longestStreak: summary?.longestStreak ?? 0,
                mocksAttempted: summary?.mocksAttempted ?? 0,
                avgAccuracy: summary?.avgAccuracy ?? 0,
                weakestSection: weakest ? weakest.sectionName : null,
                strongestSection: strongest ? strongest.sectionName : null,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ---------------------------------------------------------------------
// @route  GET /api/dashboard/streak?weeks=52
// @desc   Heatmap data: one entry per day, pre-bucketed into a 0-4 `level`
//         so the frontend never needs its own color-bucketing logic.
//         Defaults to 52 weeks (365 days) if `weeks` isn't passed.
// ---------------------------------------------------------------------
const getStreak = async (req, res, next) => {
    try {
        const weeks = Math.min(Math.max(parseInt(req.query.weeks, 10) || 52, 1), 52);
        const totalDays = weeks * 7;

        const today = new Date();
        const start = new Date(today);
        start.setUTCDate(today.getUTCDate() - (totalDays - 1));
        const startStr = toDateString(start);

        const rows = await StreakDay.find({
            user: req.user._id,
            activityDate: { $gte: startStr },
        })
            .select('activityDate sessionCount')
            .lean();

        const byDate = new Map(rows.map((r) => [r.activityDate, r.sessionCount]));

        const days = [];
        for (let i = 0; i < totalDays; i++) {
            const d = new Date(start);
            d.setUTCDate(start.getUTCDate() + i);
            const dateStr = toDateString(d);
            const sessionCount = byDate.get(dateStr) || 0;

            let level = 0;
            if (sessionCount >= 6) level = 4;
            else if (sessionCount >= 4) level = 3;
            else if (sessionCount >= 2) level = 2;
            else if (sessionCount >= 1) level = 1;

            days.push({ date: dateStr, sessionCount, level });
        }

        const activeDays = days.filter((d) => d.sessionCount > 0).length;

        res.status(200).json({ success: true, weeks, activeDays, days });
    } catch (err) {
        next(err);
    }
};

// ---------------------------------------------------------------------
// @route  POST /api/dashboard/streak/checkin
// @desc   Call after any countable prep activity (a drill, a mentor
//         session) to bump today's streak. Mock tests check in
//         automatically via recordMockTest below — no need to call
//         both for the same event.
// ---------------------------------------------------------------------
const postStreakCheckin = async (req, res, next) => {
    try {
        const counters = await checkInToday(req.user._id);
        res.status(200).json({ success: true, ...counters });
    } catch (err) {
        next(err);
    }
};

// ---------------------------------------------------------------------
// @route  GET /api/dashboard/sections
// ---------------------------------------------------------------------
const getSections = async (req, res, next) => {
    try {
        const sections = await SectionStrength.find({ user: req.user._id })
            .sort({ createdAt: 1 })
            .lean();

        res.status(200).json({
            success: true,
            sections: sections.map((s) => ({ name: s.sectionName, accuracy: s.accuracyPct })),
        });
    } catch (err) {
        next(err);
    }
};

// ---------------------------------------------------------------------
// @route  GET /api/dashboard/mocks?limit=5
// ---------------------------------------------------------------------
const getMocks = async (req, res, next) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 5, 1), 50);

        const mocks = await MockTest.find({ user: req.user._id })
            .sort({ testDate: -1 })
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            mocks: mocks.map((m) => ({
                examTag: m.examTag,
                testName: m.testName,
                testDate: m.testDate,
                scoreRaw: m.scoreRaw,
                scoreMax: m.scoreMax,
                percentile: m.percentile,
                percentileDelta: m.percentileDelta,
            })),
        });
    } catch (err) {
        next(err);
    }
};

// ---------------------------------------------------------------------
// @route  POST /api/dashboard/mocks
// @desc   Records a new mock attempt. Rolls the result into
//         DashboardSummary (percentile, delta, mocksAttempted,
//         avgAccuracy), optionally updates SectionStrength if a
//         sectional breakdown is provided, appends an activity-feed
//         entry, and counts as today's streak check-in — one POST
//         updates the whole dashboard.
// ---------------------------------------------------------------------
const recordMockTest = async (req, res, next) => {
    try {
        const { examTag, testName, testDate, scoreRaw, scoreMax, percentile, sections } = req.body;

        if (!examTag || !testName || !testDate || scoreRaw == null || scoreMax == null || percentile == null) {
            return res.status(400).json({
                success: false,
                message: 'examTag, testName, testDate, scoreRaw, scoreMax and percentile are required',
            });
        }

        const lastMock = await MockTest.findOne({ user: req.user._id }).sort({ testDate: -1 }).lean();
        const percentileDelta = lastMock ? Number((percentile - lastMock.percentile).toFixed(1)) : 0;

        const mock = await MockTest.create({
            user: req.user._id,
            examTag,
            testName,
            testDate,
            scoreRaw,
            scoreMax,
            percentile,
            percentileDelta,
            sections: Array.isArray(sections) ? sections : [],
        });

        // Roll the per-section breakdown (if any) into SectionStrength.
        if (Array.isArray(sections)) {
            for (const s of sections) {
                if (!s || !s.name || s.accuracyPct == null) continue;
                await SectionStrength.findOneAndUpdate(
                    { user: req.user._id, sectionName: s.name },
                    { accuracyPct: s.accuracyPct },
                    { upsert: true }
                );
            }
        }

        // Roll up summary numbers: mocksAttempted + avgAccuracy across all
        // mocks, plus the latest percentile/delta from the one just logged.
        const agg = await MockTest.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    avgAccuracyFraction: { $avg: { $divide: ['$scoreRaw', '$scoreMax'] } },
                },
            },
        ]);
        const { count = 0, avgAccuracyFraction = 0 } = agg[0] || {};

        await DashboardSummary.findOneAndUpdate(
            { user: req.user._id },
            {
                overallPercentile: percentile,
                percentileDelta,
                mocksAttempted: count,
                avgAccuracy: Math.round(avgAccuracyFraction * 100),
            },
            { upsert: true }
        );

        await ActivityFeedItem.create({
            user: req.user._id,
            icon: '🏆',
            message: `Logged a new ${examTag} attempt — ${testName}, ${percentile} percentile`,
        });

        // A mock attempt counts as today's streak check-in too.
        await checkInToday(req.user._id);

        res.status(201).json({ success: true, mock });
    } catch (err) {
        next(err);
    }
};

// ---------------------------------------------------------------------
// @route  GET /api/dashboard/checklist
// ---------------------------------------------------------------------
const getChecklist = async (req, res, next) => {
    try {
        const items = await GdpiChecklistItem.find({ user: req.user._id })
            .sort({ groupOrder: 1, sortOrder: 1 })
            .lean();

        res.status(200).json({
            success: true,
            checklist: items.map((i) => ({
                id: i._id,
                text: i.itemText,
                done: i.isDone,
                metaLabel: i.metaLabel,
                groupName: i.groupName,
            })),
        });
    } catch (err) {
        next(err);
    }
};

// ---------------------------------------------------------------------
// @route  PATCH /api/dashboard/checklist/:id
// @desc   Body: { done: true|false } — toggles one checklist item.
//         Scoped to req.user._id so a user can't toggle another user's item.
// ---------------------------------------------------------------------
const updateChecklistItem = async (req, res, next) => {
    try {
        const { done } = req.body;

        const item = await GdpiChecklistItem.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isDone: !!done },
            { new: true }
        );

        if (!item) {
            return res.status(404).json({ success: false, message: 'Checklist item not found' });
        }

        res.status(200).json({ success: true });
    } catch (err) {
        next(err);
    }
};

// ---------------------------------------------------------------------
// @route  GET /api/dashboard/activity?limit=10
// ---------------------------------------------------------------------
const getActivity = async (req, res, next) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

        const items = await ActivityFeedItem.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            activity: items.map((i) => ({
                icon: i.icon,
                message: i.message,
                occurredAt: i.createdAt,
            })),
        });
    } catch (err) {
        next(err);
    }
};

// ---------------------------------------------------------------------
// @route  GET /api/dashboard
// @desc   One-round-trip aggregate of everything above, for clients that
//         don't need per-card loading states.
// ---------------------------------------------------------------------
const getDashboardAggregate = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const [summary, sections, mocks, checklist, activity] = await Promise.all([
            DashboardSummary.findOne({ user: userId }).lean(),
            SectionStrength.find({ user: userId }).sort({ createdAt: 1 }).lean(),
            MockTest.find({ user: userId }).sort({ testDate: -1 }).limit(5).lean(),
            GdpiChecklistItem.find({ user: userId }).sort({ groupOrder: 1, sortOrder: 1 }).lean(),
            ActivityFeedItem.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean(),
        ]);

        const sectionsSorted = [...sections].sort((a, b) => a.accuracyPct - b.accuracyPct);
        const weakest = sectionsSorted[0] || null;
        const strongest = sectionsSorted[sectionsSorted.length - 1] || null;

        res.status(200).json({
            success: true,
            summary: {
                overallPercentile: summary?.overallPercentile ?? 0,
                percentileDelta: summary?.percentileDelta ?? 0,
                cohortRank: summary?.cohortRank ?? 0,
                cohortSize: summary?.cohortSize ?? 0,
                currentStreak: summary?.currentStreak ?? 0,
                longestStreak: summary?.longestStreak ?? 0,
                mocksAttempted: summary?.mocksAttempted ?? 0,
                avgAccuracy: summary?.avgAccuracy ?? 0,
                weakestSection: weakest ? weakest.sectionName : null,
                strongestSection: strongest ? strongest.sectionName : null,
            },
            sections: sections.map((s) => ({ name: s.sectionName, accuracy: s.accuracyPct })),
            mocks: mocks.map((m) => ({
                examTag: m.examTag,
                testName: m.testName,
                testDate: m.testDate,
                scoreRaw: m.scoreRaw,
                scoreMax: m.scoreMax,
                percentile: m.percentile,
                percentileDelta: m.percentileDelta,
            })),
            checklist: checklist.map((i) => ({
                id: i._id,
                text: i.itemText,
                done: i.isDone,
                metaLabel: i.metaLabel,
                groupName: i.groupName,
            })),
            activity: activity.map((i) => ({ icon: i.icon, message: i.message, occurredAt: i.createdAt })),
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getSummary,
    getStreak,
    postStreakCheckin,
    getSections,
    getMocks,
    recordMockTest,
    getChecklist,
    updateChecklistItem,
    getActivity,
    getDashboardAggregate,
};