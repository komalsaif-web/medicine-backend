const express = require('express');
const router = express.Router();
const {
  signup,
  verifyOtpCode,
  login,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/verify-otp', verifyOtpCode);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
