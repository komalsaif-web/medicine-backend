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

    // Save uploaded image
    const tempPath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const newPath = tempPath + ext;
    fs.renameSync(tempPath, newPath);
    imagePath = newPath;

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

    // ✅ FIXED: Use .rows to get arrays
    const medicineRes = await query('SELECT * FROM medicines');
    const medicines = medicineRes.rows;

    const imageFilesRes = await query('SELECT image_name FROM medicine_image_name');
    const imageFiles = imageFilesRes.rows.map(row => row.image_name);

    const medicineNames = medicines.map(m => m.name.toLowerCase());

    const findAndAddMatches = (imageName, medicine, confidence, matchType, matchedTerm) => {
      const fullImagePath = path.join(__dirname, '..', 'images-db', imageName);
      if (fs.existsSync(fullImagePath) && imageFiles.includes(imageName)) {
        const imageData = fs.readFileSync(fullImagePath).toString('base64');
        results.push({
          id: medicine?.id || null,
          name: medicine?.name || matchedTerm,
          imageUrl: `/images-db/${imageName}`,
          imageData,
          confidence,
          matchType,
          matchedTerm
        });
      }
    };

    // Step 1: Direct filename match
    imageFiles.forEach(file => {
      const fileName = path.basename(file, path.extname(file)).toLowerCase();
      const fileNameClean = fileName.replace(/[-_]/g, ' ');
      const medicine = medicines.find(m => m.name.toLowerCase().replace(/\s+/g, '_') === fileName);
      if (cleanText.includes(fileNameClean)) {
        findAndAddMatches(file, medicine, 'high', 'direct_filename', fileNameClean);
      }
    });

    // Step 2: Exact text match
    if (results.length === 0) {
      medicineNames.forEach((medName, index) => {
        if (cleanText.includes(medName)) {
          const baseName = medName.replace(/\s+/g, '_');
          imageFiles.forEach(file => {
            if (file.toLowerCase().startsWith(baseName)) {
              findAndAddMatches(file, medicines[index], 'high', 'exact_text', medName);
            }
          });
        }
      });
    }

    // Step 3: Partial text match
    if (results.length === 0) {
      medicineNames.forEach((medName, index) => {
        const medWords = medName.split(' ').filter(w => w.length > 3);
        for (const word of medWords) {
          if (cleanText.includes(word)) {
            const baseName = medName.replace(/\s+/g, '_');
            imageFiles.forEach(file => {
              if (file.toLowerCase().startsWith(baseName)) {
                findAndAddMatches(file, medicines[index], 'medium', 'partial_text', word);
              }
            });
            break;
          }
        }
      });
    }

    // Step 4: Fuzzy match
    if (results.length === 0) {
      let bestMatch = { file: null, similarity: 0, medicine: null };
      imageFiles.forEach(file => {
        const fileName = path.basename(file, path.extname(file)).toLowerCase();
        const fileNameClean = fileName.replace(/[-_]/g, ' ');
        const similarity = stringSimilarity.compareTwoStrings(fileNameClean, cleanText);
        const medicine = medicines.find(m => m.name.toLowerCase().replace(/\s+/g, '_') === fileName);
        if (similarity > bestMatch.similarity && similarity > 0.7) {
          bestMatch = { file, similarity, medicine };
        }
      });

      if (bestMatch.file) {
        findAndAddMatches(
          bestMatch.file,
          bestMatch.medicine,
          'low',
          'fuzzy_filename',
          path.basename(bestMatch.file, path.extname(bestMatch.file)).replace(/[-_]/g, ' ')
        );
      }
    }

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
