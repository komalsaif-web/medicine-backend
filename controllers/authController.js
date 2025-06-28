const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const {
  createUser,
  findUserByEmail,
  updateResetToken,
  findUserByResetToken,
  updateUserPassword
} = require('../models/userModel');

// SIGNUP
const signup = async (req, res) => {
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

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET
  );

  res.status(201).json({
    message: 'Signup successful',
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
    },
    token,
  });
};

// LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and Password are required' });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET
  );

  res.status(200).json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
    },
    token,
  });
};

// ✅ FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await findUserByEmail(email);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 3600000; // 1 hour

  await updateResetToken(user.id, token, expiresAt);

  const resetLink = `http://localhost:3000/reset-password/${token}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Gmail
      pass: process.env.EMAIL_PASS  // App Password
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Password Reset',
    text: `Click the link to reset password: ${resetLink}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send email' });
  }
};

// ✅ RESET PASSWORD
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await findUserByResetToken(token);
  if (!user || user.reset_token_expire < Date.now()) {
    return res.status(400).json({ message: 'Token is invalid or expired' });
  }

  const hashed = await bcrypt.hash(password, 10);
  await updateUserPassword(user.id, hashed);

  res.status(200).json({ message: 'Password reset successful' });
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword
};
