const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/userModel');

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

  // 🔐 Token without expiry
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET // 👈 no expiresIn here
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

module.exports = {
  signup,
};
