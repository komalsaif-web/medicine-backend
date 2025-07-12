const express = require('express');
const router = express.Router();
const {
  signup,
  verifyOtpCode,
  login,
  forgotPassword,
  resetPassword,
  updateUserInfo,
  getUserDetails,
  deleteUserAccount,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/verify-otp', verifyOtpCode);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/update-user/:id', updateUserInfo);
router.get('/user/:userId', getUserDetails);
router.delete('/delete/:id', deleteUserAccount);
module.exports = router;
 