const db = require('../config/db');

const createUser = async (email, phone, password) => {
  const result = await db.query(
    'INSERT INTO users (email, phone, password) VALUES ($1, $2, $3) RETURNING id, email, phone',
    [email, phone, password]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const updateResetToken = async (id, token, expiresAt) => {
  await db.query(
    'UPDATE users SET reset_token = $1, reset_token_expire = $2 WHERE id = $3',
    [token, expiresAt, id]
  );
};

const findUserByResetToken = async (token) => {
  const result = await db.query('SELECT * FROM users WHERE reset_token = $1', [token]);
  return result.rows[0];
};

const updateUserPassword = async (id, newPassword) => {
  await db.query(
    'UPDATE users SET password = $1, reset_token = NULL, reset_token_expire = NULL WHERE id = $2',
    [newPassword, id]
  );
};

module.exports = {
  createUser,
  findUserByEmail,
  updateResetToken,
  findUserByResetToken,
  updateUserPassword
};
