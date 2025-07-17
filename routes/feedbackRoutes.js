const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');


router.post('/feedback', feedbackController.submitFeedback);
router.get('/feedback/:id', feedbackController.getFeedback);
router.get('/all-feedback', feedbackController.getAllFeedback);

module.exports = router;
