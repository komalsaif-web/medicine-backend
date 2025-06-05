const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const Tesseract = require('tesseract.js');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kzhbzvkfpjftklzcydze.supabase.co';
const supabaseKey = 'your_supabase_anon_key';
const supabase = createClient(supabaseUrl, supabaseKey);

// OCR using OCR.Space
const ocrFromFile = async (filePath) => {
  const formData = new FormData();
  formData.append('apikey', 'your_ocr_space_api_key');
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

// Get public URL from Supabase for given filename (try png, then jpg)
async function getMedicineImageUrl(baseName) {
  const extensions = ['png', 'jpg', 'jpeg'];
  for (const ext of extensions) {
    const fileName = `${baseName}.${ext}`;
    const { data, error } = supabase.storage
      .from('medicine-images')
      .getPublicUrl(fileName);

    if (!error && data?.publicUrl) {
      // To verify file actually exists, try HEAD request
      try {
        await axios.head(data.publicUrl);
        return data.publicUrl;
      } catch {
        // File doesn't exist at this url, try next
      }
    }
  }
  return null;
}

exports.analyzeImage = async (req, res) => {
  let imagePath;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    imagePath = req.file.path;

    // Step 1: OCR try
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

    let extractedText = ocrResult.ParsedResults[0]?.ParsedText || '';
    extractedText = extractedText.toLowerCase().replace(/[\n\r]+/g, ' ').replace(/[^\w\s]/g, ' ').trim();

    console.log('📝 Extracted Text:', extractedText);

    if (!extractedText) {
      return res.status(404).json({ success: false, message: 'No text detected' });
    }

    // Step 2: Tokenize text and try to find any medicine image by token
    const tokens = extractedText.split(/\s+/);

    let foundImageUrl = null;
    let matchedToken = null;

    for (const token of tokens) {
      if (token.length < 3) continue; // ignore too short tokens

      const url = await getMedicineImageUrl(token);
      if (url) {
        foundImageUrl = url;
        matchedToken = token;
        break;
      }
    }

    // Step 3: Delete temp image
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    if (foundImageUrl) {
      return res.json({
        success: true,
        detectedWord: matchedToken,
        medicineImageUrl: foundImageUrl,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No matching medicine image found for detected text',
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
      details: error.message,
    });
  }
};
