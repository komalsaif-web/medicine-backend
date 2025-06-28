const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/userModel');

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

// ✅ LOGIN
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

module.exports = {
  signup,
  login,
};
