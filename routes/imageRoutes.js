const express = require('express');
const router = express.Router();
const multer = require('multer');
const imageController = require('../controllers/imageController');

const upload = multer({ dest: 'uploads/' });

router.post('/analyze', upload.single('image'), imageController.analyzeImage);

module.exports = router;
