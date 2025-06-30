const pool = require('../config/db');

// ✅ Create a new user
const createUser = async (email, phone, hashedPassword) => {
  const result = await pool.query(
    'INSERT INTO users (email, phone, password, is_verified) VALUES ($1, $2, $3, false) RETURNING *',
    [email, phone, hashedPassword]
  );
  return result.rows[0];
};

// ✅ Find user by email
const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

// ✅ Find user by phone
const findUserByPhone = async (phone) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE phone = $1',
    [phone]
  );
  return result.rows[0];
};

// ✅ Update user password
const updateUserPassword = async (userId, hashedPassword) => {
  await pool.query(
    'UPDATE users SET password = $1 WHERE id = $2',
    [hashedPassword, userId]
  );
};

// ✅ Update OTP and expiration
const updateUserOtp = async (userId, otp, expireMs) => {
  // Convert milliseconds to Date object → PostgreSQL will handle it as timestamp
  const expire = new Date(expireMs);

  await pool.query(
    'UPDATE users SET otp = $1, otp_expire = $2 WHERE id = $3',
    [otp, expire, userId]
  );
};

// ✅ Verify OTP and check if not expired
const verifyOtp = async (email, otp) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND otp = $2 AND otp_expire > NOW()',
    [email, otp]
  );
  return result.rows[0];
};

// ✅ Mark user as verified
const markUserVerified = async (userId) => {
  await pool.query(
    'UPDATE users SET is_verified = true, otp = NULL, otp_expire = NULL WHERE id = $1',
    [userId]
  );
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByPhone,
  updateUserPassword,
  updateUserOtp,
  verifyOtp,
  markUserVerified,
};
