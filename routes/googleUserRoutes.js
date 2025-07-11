const express = require('express');
const router = express.Router();
const {
  loginGoogleUser,
  getGoogleUserById
} = require('../controllers/googleUserController');

// 🔹 POST → Login/Register Google User
router.post('/google', loginGoogleUser);

// 🔹 GET → Fetch Google user by ID
router.get('/google/:id', getGoogleUserById);

module.exports = router;
