const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const authenticateUser = require('../middleware/authMiddleware');

// POST feedback (authenticated)
router.post('/feedback', authenticateUser, feedbackController.submitFeedback);

// GET feedback for logged-in user
router.get('/feedback', authenticateUser, feedbackController.getFeedback);

module.exports = router;
