// userModel.js
const pool = require('../config/db');

// ✅ Create new user (Full Payload)
const createUser = async ({
  name,
  email,
  password,
  registration_number = null,
  license_document_url = null,
  contact_person = null,
  phone_number = null,
  address = null,
  verified_by_admin = false,
  is_blacklisted = false,
  role = null,
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

const getUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const findUserByEmail = getUserByEmail;

const findUserByPhone = async (phone_number) => {
  const result = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
  return result.rows[0];
};

const updateUserPassword = async (userId, hashedPassword) => {
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
};

const updateUserOtp = async (userId, otp, expireMs) => {
  const expire = new Date(expireMs);
  await pool.query('UPDATE users SET otp = $1, otp_expire = $2 WHERE id = $3', [otp, expire, userId]);
};

const verifyOtp = async (email, otp) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1 AND otp = $2 AND otp_expire > NOW()`,
    [email, otp]
  );
  return result.rows[0];
};

const markUserVerified = async (userId) => {
  await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [userId]);
};

const getUserById = async (id) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

const deleteUserById = async (userId) => {
  const result = await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  return result.rowCount > 0;
};

const getAllUsers = async () => {
  const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  return result.rows;
};

const deleteAllUsers = async () => {
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
  getAllUsers,
  deleteAllUsers
};