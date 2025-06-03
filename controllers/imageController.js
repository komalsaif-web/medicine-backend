const fs = require('fs');
const path = require('path');
const connection = require('../config/db');
const util = require('util');
const axios = require('axios');
const FormData = require('form-data');
const stringSimilarity = require('string-similarity');
const Tesseract = require('tesseract.js');

const query = util.promisify(connection.query).bind(connection);

// OCR function using OCR.Space
const ocrFromFile = async (filePath) => {
  const formData = new FormData();
  formData.append('apikey', 'K84923390588957');
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');
  formData.append('file', fs.createReadStream(filePath));

  try {
    const response = await axios.post('https://api.ocr.space/parse/image', formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    return response.data;
  } catch (error) {
    console.error('OCR.Space Error:', error);
    throw new Error('OCR.Space processing failed');
  }
};

// OCR function using Tesseract.js
const ocrWithTesseract = async (filePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      filePath,
      'eng',
      {
        logger: (m) => console.log('Tesseract Progress:', m),
      }
    );
    return { ParsedResults: [{ ParsedText: text }], IsErroredOnProcessing: false };
  } catch (error) {
    console.error('Tesseract Error:', error);
    throw new Error('Tesseract OCR processing failed');
  }
};

// Imagga tagging function
const imaggaTagsFromFile = async (filePath) => {
  const imaggaApiKey = 'acc_15873334bc3503d';
  const imaggaApiSecret = '4674e97328695eba64db96491e56587c';

  const fileStream = fs.createReadStream(filePath);
  const formData = new FormData();
  formData.append('image', fileStream);

  const auth = Buffer.from(`${imaggaApiKey}:${imaggaApiSecret}`).toString('base64');

  try {
    const response = await axios.post('https://api.imagga.com/v2/tags', formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Basic ${auth}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Imagga Error:', error);
    throw new Error('Image tagging failed');
  }
};

// Main controller function
exports.analyzeImage = async (req, res) => {
  let imagePath;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Fix: Add file extension to multer uploaded file
    const tempPath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const newPath = tempPath + ext;
    fs.renameSync(tempPath, newPath);
    imagePath = newPath;

    const results = [];

    // Perform OCR (try OCR.Space first, fallback to Tesseract) and Imagga tagging
    let ocrResult;
    try {
      ocrResult = await ocrFromFile(imagePath);
    } catch (error) {
      console.warn('Falling back to Tesseract.js due to OCR.Space failure');
      ocrResult = await ocrWithTesseract(imagePath);
    }

    // Process OCR results
    if (ocrResult.IsErroredOnProcessing) {
      throw new Error(ocrResult.ErrorMessage?.join(', ') || 'OCR processing error');
    }

    const extractedText = ocrResult.ParsedResults[0]?.ParsedText?.toLowerCase() || '';
    const cleanText = extractedText.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
    console.log('📝 Extracted Text:', cleanText);

    // Process Imagga tags
    const imaggaResult = await imaggaTagsFromFile(imagePath);
    const tags = (imaggaResult.result?.tags || [])
      .filter(t => t.confidence >= 20)
      .map(t => t.tag.en.toLowerCase());
    console.log('🏷️ Imagga Tags:', tags);

    // Fetch medicines from database
    const medicines = await query('SELECT * FROM medicines');
    console.log('🧪 Medicines from DB:', medicines.map(m => m.name));
    const medicineNames = medicines.map(m => m.name.toLowerCase());

    // Get all available images from medicine_image_name table
    const imageFilesResult = await query('SELECT image_name FROM medicine_image_name');
    const imageFiles = imageFilesResult.map(row => row.image_name);
    console.log('🖼️ Available Images:', imageFiles);

    // Matching logic helper
    const findAndAddMatches = (imageName, medicine, confidence, matchType, matchedTerm) => {
      const imagePath = path.join(__dirname, '..', 'images-db', imageName);
      if (fs.existsSync(imagePath) && imageFiles.includes(imageName)) {
        const imageData = fs.readFileSync(imagePath);
        const base64Image = imageData.toString('base64');
        console.log(`✅ Match found: ${imageName} (Confidence: ${confidence}, Type: ${matchType})`);
        results.push({
          id: medicine?.id || null,
          name: medicine?.name || matchedTerm,
          imageUrl: `/images-db/${imageName}`,
          imageData: base64Image,
          confidence,
          matchType,
          matchedTerm
        });
      }
    };

    // 1. Direct filename match with OCR text
    imageFiles.forEach(file => {
      const fileName = path.basename(file, path.extname(file)).toLowerCase();
      const fileNameClean = fileName.replace(/[-_]/g, ' ');
      const medicine = medicines.find(m => m.name.toLowerCase().replace(/\s+/g, '_') === fileName);

      if (cleanText.includes(fileNameClean)) {
        findAndAddMatches(file, medicine, 'high', 'direct_filename', fileNameClean);
      }
    });

    // 2. Exact text match with medicine names
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

    // 3. Partial match with medicine names
    if (results.length === 0) {
      medicineNames.forEach((medName, index) => {
        const medWords = medName.split(' ').filter(word => word.length > 3);
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

    // 4. Fuzzy match with OCR text against filenames
    if (results.length === 0) {
      let bestMatch = { file: null, similarity: 0, medicine: null };
      imageFiles.forEach(file => {
        const fileName = path.basename(file, path.extname(file)).toLowerCase();
        const fileNameClean = fileName.replace(/[-_]/g, ' ');
        const similarity = stringSimilarity.compareTwoStrings(fileNameClean, cleanText);
        console.log(`🔍 Fuzzy match attempt: ${fileNameClean} vs ${cleanText} (Similarity: ${similarity})`);
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

    // Clean up uploaded file
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Prepare response
    if (results.length > 0) {
      const uniqueResults = results.filter((t, index, self) =>
        index === self.findIndex(u => u.imageUrl === t.imageUrl)
      );
      console.log('📝 Response Matches:', uniqueResults.map(r => r.name));
      return res.json({
        success: true,
        found: true,
        matches: uniqueResults,
        detectedText: cleanText,
        imaggaTags: tags,
        message: "Matching medicine found"
      });
    } else {
      const allImages = imageFiles.map(file => {
        const imagePath = path.join(__dirname, '..', 'images-db', file);
        const imageData = fs.existsSync(imagePath) ? fs.readFileSync(imagePath).toString('base64') : null;
        return {
          imageUrl: `/images/${file}`,
          fileName: file,
          imageData
        };
      });
      console.log('📤 No matches found, returning available images');
      return res.status(404).json({
        success: false,
        found: false,
        message: 'No matching medicine found',
        detectedText: cleanText,
        imaggaTags: tags,
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