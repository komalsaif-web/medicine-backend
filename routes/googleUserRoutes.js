const express = require('express');
const router = express.Router();
const { saveGoogleUser } = require('../controllers/googleUserController');

// 🔹 POST /api/users/google → Save Google login info
router.post('/google', saveGoogleUser);

module.exports = router;
