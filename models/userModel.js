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

// ✅ Update OTP and expiration (timestamp based)
const updateUserOtp = async (userId, otp, expireMs) => {
  const expire = new Date(expireMs); // JS Date object → PostgreSQL will treat as timestamp
  await pool.query(
    'UPDATE users SET otp = $1, otp_expire = $2 WHERE id = $3',
    [otp, expire, userId]
  );
};

// ✅ Verify OTP and check expiry
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

const updateUserFields = async (userId, fields) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) return false;

  const updates = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = Object.values(fields);

  const query = `UPDATE users SET ${updates} WHERE id = $${keys.length + 1}`;
  await pool.query(query, [...values, userId]);

  return true;
};
const getUserById = async (userId) => {
  const result = await pool.query(
    'SELECT id, email, phone, is_verified FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByPhone,
  updateUserPassword,
  updateUserOtp,
  verifyOtp,
  markUserVerified,
  updateUserFields,
  getUserById
};
