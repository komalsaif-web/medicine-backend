const express = require('express');
const router = express.Router();
const controller = require('../controllers/playerController');

router.get('/player/:name', controller.getPlayerProfile);

module.exports = router;
