const fs = require('fs');
const path = require('path');
const connection = require('../config/db');
const util = require('util');
const axios = require('axios');
const stringSimilarity = require('string-similarity');
const Tesseract = require('tesseract.js');
const FormData = require('form-data');

const query = util.promisify(connection.query).bind(connection);

// OCR using OCR.Space
const ocrFromFile = async (filePath) => {
  const formData = new FormData();
  formData.append('apikey', 'K84923390588957');
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');
  formData.append('file', fs.createReadStream(filePath));

  const response = await axios.post('https://api.ocr.space/parse/image', formData, {
    headers: formData.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return response.data;
};

// Fallback OCR using Tesseract.js
const ocrWithTesseract = async (filePath) => {
  const { data: { text } } = await Tesseract.recognize(
    filePath,
    'eng',
    { logger: m => console.log('Tesseract Progress:', m) }
  );
  return { ParsedResults: [{ ParsedText: text }], IsErroredOnProcessing: false };
};

// Main Controller
exports.analyzeImage = async (req, res) => {
  let imagePath;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Use the file path provided by multer
    imagePath = req.file.path;

    const results = [];

    // OCR
    let ocrResult;
    try {
      ocrResult = await ocrFromFile(imagePath);
    } catch {
      console.warn('⚠️ Falling back to Tesseract.js');
      ocrResult = await ocrWithTesseract(imagePath);
    }

    if (ocrResult.IsErroredOnProcessing) {
      throw new Error(ocrResult.ErrorMessage?.join(', ') || 'OCR failed');
    }

    const extractedText = ocrResult.ParsedResults[0]?.ParsedText?.toLowerCase() || '';
    const cleanText = extractedText.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
    console.log('📝 Extracted Text:', cleanText);

    // [Your existing database query and matching logic remains unchanged]

    // Cleanup uploaded image
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Respond
    if (results.length > 0) {
      const uniqueResults = results.filter((t, i, self) =>
        i === self.findIndex(u => u.imageUrl === t.imageUrl)
      );
      return res.json({
        success: true,
        found: true,
        matches: uniqueResults,
        detectedText: cleanText,
        message: "Matching medicine found"
      });
    } else {
      const allImages = imageFiles.map(file => {
        const filePath = path.join(__dirname, '..', 'images-db', file);
        const imageData = fs.existsSync(filePath) ? fs.readFileSync(filePath).toString('base64') : null;
        return {
          imageUrl: `/images/${file}`,
          fileName: file,
          imageData
        };
      });

      return res.status(404).json({
        success: false,
        found: false,
        message: 'No matching medicine found',
        detectedText: cleanText,
        availableImages: allImages
      });
    }

  } catch (error) {
    console.error('Controller Error:', error);
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    return res.status(500).json({
      success: false,
      error: 'Processing failed',
      details: error.message
    });
  }
};