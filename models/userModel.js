const pool = require('../config/db');

// ✅ Create new user (Full Payload)
const createUser = async ({
  name,
  email,
  password,
  registration_number,
  license_document_url,
  contact_person,
  phone_number,
  address,
  verified_by_admin = false,
  is_blacklisted = false,
  role,
}) => {
  const result = await pool.query(
    `INSERT INTO users (
      name, email, password,
      registration_number,
      license_document_url,
      contact_person,
      phone_number,
      address,
      verified_by_admin,
      is_blacklisted,
      role
    ) VALUES (
      $1, $2, $3,
      $4, $5, $6,
      $7, $8, $9,
      $10, $11
    ) RETURNING *`,
    [
      name,
      email,
      password,
      registration_number,
      license_document_url,
      contact_person,
      phone_number,
      address,
      verified_by_admin,
      is_blacklisted,
      role
    ]
  );
  return result.rows[0];
};

// ✅ Find user by email
const getUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

// ✅ Find user by phone
const findUserByPhone = async (phone_number) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE phone_number = $1',
    [phone_number]
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

// ✅ Update OTP and expiry
const updateUserOtp = async (userId, otp, expireMs) => {
  const expire = new Date(expireMs);
  await pool.query(
    'UPDATE users SET otp = $1, otp_expire = $2 WHERE id = $3',
    [otp, expire, userId]
  );
};

// ✅ Verify OTP
const verifyOtp = async (email, otp) => {
  const result = await pool.query(
    `SELECT * FROM users 
     WHERE email = $1 AND otp = $2 AND otp_expire > NOW()`,
    [email, otp]
  );
  return result.rows[0];
};

// ✅ Mark user as verified
const markUserVerified = async (userId) => {
  await pool.query(
    'UPDATE users SET is_verified = true WHERE id = $1',
    [userId]
  );
};

// ✅ Get user by ID
const getUserById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

// ✅ Delete user by ID
const deleteUserById = async (userId) => {
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1',
    [userId]
  );
  return result.rowCount > 0;
};

// ✅ Get all users
const getAllusers = async () => {
  const result = await pool.query(
    'SELECT * FROM users ORDER BY created_at DESC'
  );
  return result.rows;
};

// ✅ Delete all users
const deleteAllusers = async () => {
  return await pool.query('DELETE FROM users');
};

const updateUserById = async (id, updates) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) return null;

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

  const query = `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;

  const result = await pool.query(query, [...values, id]);
  return result.rows[0];
};
// ✅ Find user by email
const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0]; // null return hoga agar user na mile
};

module.exports = {
  createUser,
  getUserByEmail,
  findUserByEmail,
  findUserByPhone,
  updateUserPassword,
  updateUserOtp,
  verifyOtp,
  markUserVerified,
  updateUserById,
  getUserById,
  deleteUserById,
  getAllusers,
  deleteAllusers,
};
