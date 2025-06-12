const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyImageController = require('../controllers/verifyImageController');

// Configure multer to use /tmp with unique filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// POST route to verify image
router.post('/verify', upload.single('image'), verifyImageController.verifyMedicineImage);

module.exports = router;
