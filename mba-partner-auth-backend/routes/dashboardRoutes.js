const express = require('express');
const {
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
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Every dashboard route requires a logged-in user.
router.use(protect);

router.get('/', getDashboardAggregate);
router.get('/summary', getSummary);
router.get('/streak', getStreak);
router.post('/streak/checkin', postStreakCheckin);
router.get('/sections', getSections);
router.get('/mocks', getMocks);
router.post('/mocks', recordMockTest);
router.get('/checklist', getChecklist);
router.patch('/checklist/:id', updateChecklistItem);
router.get('/activity', getActivity);

module.exports = router;
