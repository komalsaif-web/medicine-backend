const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const CryptoJS = require('crypto-js');

const {
  createUser,
  findUserByphone_number,
  updateUserOtp,
  verifyOtp,
  markUserVerified,
  getUserById,
  deleteUserById,
  getUserByEmail,
  getAllUsers,
  findUserByEmail,
   deleteAllUsers,
   updateUserById ,
} = require('../models/userModel');

// 📧 Send OTP via email
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"PHARMASENZ" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}. It will expire in 1 minute.`,
  });
};
// ✅ Signup Controller
const signup = async (req, res) => {
  try {
    const {
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
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check for existing user
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      registration_number: registration_number || null,
      license_document_url: license_document_url || null,
      contact_person: contact_person || null,
      phone_number: phone_number || null,
      address: address || null,
      verified_by_admin: verified_by_admin || false,
      is_blacklisted: is_blacklisted || false,
      role: role || 'pharmacist' // default to pharmacist if not provided
    });

    // JWT Token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const encryptedToken = CryptoJS.AES.encrypt(token, process.env.ENCRYPTION_SECRET).toString();

    res.status(201).json({
      message: 'Signup successful.',
      token: encryptedToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        is_verified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};



const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.is_verified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expire = new Date(Date.now() + 60 * 1000); // expires in 1 minute

    await updateUserOtp(user.id, otp, expire);
    console.log(`Generated OTP for ${email}: ${otp}`);

    await sendOtpEmail(email, otp);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('❌ Send OTP Error:', error.message);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};
// ✅ VERIFY OTP
const verifyOtpCode = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await verifyOtp(email, otp);
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await markUserVerified(user.id);

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};

// ✅ LOGIN FUNCTION
const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Email/phone_number and Password are required' });
    }

    const user = loginId.includes('@')
      ? await findUserByEmail(loginId)
      : await findUserByphone_number(loginId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email before login' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const encryptedToken = CryptoJS.AES.encrypt(token, process.env.ENCRYPTION_SECRET).toString();

    res.status(200).json({
      message: 'Login successful',
      token: encryptedToken,
      id: user.id,
      user: {
        name: user.name,
        email: user.email,
        phone_number: user.phone_number
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// ✅ FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'You can now reset your password' });
  } catch (error) {
    res.status(500).json({ message: 'Forgot password error', error: error.message });
  }
};


// ✅ GET USER BY ID
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    const user = await getUserById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};

// ✅ DELETE USER
const deleteUserAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: 'User ID is required' });

    const deleted = await deleteUserById(id);
    if (deleted) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found or already deleted' });
    }
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.is_verified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expire = new Date(Date.now() + 60 * 1000); // ✅ 1 minute expiry

    await updateUserOtp(user.id, otp, expire);
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ message: 'Failed to resend OTP', error: error.message });
  }
};
// ✅ Get user by email controller
const getUserByEmailController = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get User by Email Error:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};
const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ users });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

const deleteAllUsersController = async (req, res) => {
  try {
    const deleted = await deleteAllUsers();
    res.status(200).json({
      message: `All users deleted successfully (${deleted.rowCount} records removed)`
    });
  } catch (error) {
    console.error('Delete All Users Error:', error);
    res.status(500).json({ message: 'Failed to delete all users', error: error.message });
  }
};
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'At least one field is required to update' });
    }

    // ✅ Hash password if included
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await updateUserById(id, updates);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found or update failed' });
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update User Error:', error);

    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email already exists', error: error.detail });
    }

    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};



module.exports = {
  signup,
  resendOtp,
  verifyOtpCode,
  login,
  sendOtp,
  forgotPassword,
  getUserDetails,
  deleteUserAccount,
  getUserByEmailController,
  getAllUsersController,
  deleteAllUsersController,
  updateUser 
};
