const express = require('express');
const multer = require('multer');
const path = require('path');
const imageController = require('../controllers/imageController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

const router = express.Router();
router.post('/analyze', upload.single('image'), imageController.analyzeImage);

module.exports = router;
