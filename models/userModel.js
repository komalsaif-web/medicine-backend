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

const findUserByPhone = async (phone) => {
  const result = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
  return result.rows[0];
};

const updateUserPassword = async (id, newPassword) => {
  await db.query('UPDATE users SET password = $1 WHERE id = $2', [newPassword, id]);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByPhone,
  updateUserPassword,
};
