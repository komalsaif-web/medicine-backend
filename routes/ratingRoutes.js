const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');

router.post('/rating', ratingController.submitRating);
router.get('/rating/average', ratingController.getAverageRating);
router.get('/rating/:id', ratingController.getUserRating);
router.get('/all-rating', ratingController.getAllRatings);

module.exports = router;
