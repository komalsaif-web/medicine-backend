const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// POST /api/feedback
router.post('/feedback', feedbackController.submitFeedback);

module.exports = router;
