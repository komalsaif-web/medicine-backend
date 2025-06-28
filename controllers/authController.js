const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  createUser,
  findUserByEmail,
  findUserByPhone,
  updateUserPassword
} = require('../models/userModel');

// ✅ SIGNUP
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

// ✅ LOGIN (Email or Phone)
const login = async (req, res) => {
  const { loginId, password } = req.body;

  if (!loginId || !password) {
    return res.status(400).json({ message: 'Email/Phone and Password are required' });
  }

  // Determine if loginId is email or phone
  const user = loginId.includes('@')
    ? await findUserByEmail(loginId)
    : await findUserByPhone(loginId);

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

  // In this version, just allow frontend to move to reset screen
  res.status(200).json({ message: 'You can now reset your password' });
};

// ✅ RESET PASSWORD
const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  const user = await findUserByEmail(email);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const hashed = await bcrypt.hash(password, 10);
  await updateUserPassword(user.id, hashed);

  res.status(200).json({ message: 'Password reset successful' });
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
};
