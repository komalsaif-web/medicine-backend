const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');

router.post('/rating', ratingController.submitRating);
router.get('/rating/:id', ratingController.getUserRating);

module.exports = router;
