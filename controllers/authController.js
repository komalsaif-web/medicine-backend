const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const CryptoJS = require('crypto-js');

const {
  createUser,
  findUserByEmail,
  findUserByPhone,
  updateUserPassword,
  updateUserOtp,
  verifyOtp,
  markUserVerified,
  updateUserFields,
  getUserById
} = require('../models/userModel');

// 📧 Send OTP via email
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"PHARMASENZ" <${process.env.EMAIL_USER}>`, // ✅ Sender name + email
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
  });
};


// ✅ SIGNUP
const signup = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(email, phone, hashedPassword);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expire = Date.now() + 10 * 60 * 1000;

    await updateUserOtp(user.id, otp, expire);
    await sendOtpEmail(email, otp);

    res.status(201).json({
      message: 'Signup successful. OTP sent to your email. Please verify.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};

// ✅ VERIFY OTP
const verifyOtpCode = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await verifyOtp(email, otp);
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await markUserVerified(user.id);

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};
// LOGIN FUNCTION
const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Email/Phone and Password are required' });
    }

    const user = loginId.includes('@')
      ? await findUserByEmail(loginId)
      : await findUserByPhone(loginId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email before login' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const encryptedToken = CryptoJS.AES.encrypt(token, process.env.ENCRYPTION_SECRET).toString();

   res.status(200).json({
  message: 'Login successful',
  token: encryptedToken,
  id: user.id,
  user: {
    name: user.name,
    email: user.email,
    phone: user.phone
  }
});


  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};


// ✅ FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'You can now reset your password' });
  } catch (error) {
    res.status(500).json({ message: 'Forgot password error', error: error.message });
  }
};

// ✅ RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashed = await bcrypt.hash(password, 10);
    await updateUserPassword(user.id, hashed);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
};

// ✅ UPDATE USER INFO (email, phone, password)
const updateUserInfo = async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, phone, password, name } = req.body; // name added

    if (!userId) return res.status(400).json({ message: 'User ID is required' });
    if (!email && !phone && !password && !name) {
      return res.status(400).json({ message: 'At least one field is required to update' });
    }

    const updates = {};
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (name) updates.name = name;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    const updated = await updateUserFields(userId, updates);

    if (updated) {
      res.status(200).json({ message: 'User updated successfully' });
    } else {
      res.status(500).json({ message: 'Update failed' });
    }
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

// ✅ GET USER BY ID
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    const user = await getUserById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};


module.exports = {
  signup,
  verifyOtpCode,
  login,
  forgotPassword,
  resetPassword,
  updateUserInfo,
  getUserDetails
};
