const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload')

const {
  signup,
  verifyOtpCode,
  login,
  forgotPassword,
  getUserDetails,
  deleteUserAccount,
  resendOtp,
  sendOtp,
  getUserByEmailController,
  getAllUsersController,
  deleteAllUsersController,
  updateUser,
  uploadImage,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtpCode);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/get-user/:id', getUserDetails);
router.delete('/delete-user/:id', deleteUserAccount);
router.post('/resend-otp', resendOtp);
router.get('/get-user-by-email/:email', getUserByEmailController);
router.get('/get-all-users', getAllUsersController);
router.delete('/delete-all-users', deleteAllUsersController); 
router.put('/update-user/:id', updateUser);
router.post('/upload', upload.single('image'), uploadImage);
module.exports = router;
 