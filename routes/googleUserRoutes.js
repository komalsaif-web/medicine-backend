const express = require('express');
const router = express.Router();
const {
  saveGoogleUser,
  getGoogleUserById
} = require('../controllers/googleUserController');

// 🔹 POST → Save new Google user
router.post('/google', saveGoogleUser);

// 🔹 GET → Fetch user by ID
router.get('/google/:id', getGoogleUserById);

module.exports = router;
