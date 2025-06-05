const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const Tesseract = require('tesseract.js');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kzhbzvkfpjftklzcydze.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6aGJ6dmtmcGpmdGtsemN5ZHplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAzODM0MiwiZXhwIjoyMDY0NjE0MzQyfQ.2BkpY_vf1B6KiJ8X1ykQZVaS6qsdHjjHuB0NuRCy5d4'
);

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

// Tesseract fallback
const ocrWithTesseract = async (filePath) => {
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
  return { ParsedResults: [{ ParsedText: text }], IsErroredOnProcessing: false };
};

// Try to get public URL for given token and extension
async function getPublicUrlForToken(token) {
  const extensions = ['png', 'jpg', 'jpeg'];
  for (const ext of extensions) {
    const filename = `${token.toLowerCase()}.${ext}`;
    const { data, error } = supabase.storage
      .from('medicine-images')
      .getPublicUrl(filename);

    if (!error && data?.publicUrl) {
      try {
        await axios.head(data.publicUrl); // Check if file exists
        return data.publicUrl;
      } catch {
        continue;
      }
    }
  }
  return null;
}

// Convert image at URL to base64
const getBase64FromUrl = async (url) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const contentType = response.headers['content-type'];
  const base64 = Buffer.from(response.data, 'binary').toString('base64');
  return `data:${contentType};base64,${base64}`;
};

exports.analyzeImage = async (req, res) => {
  let imagePath;

  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    imagePath = req.file.path;

    // Step 1: OCR or fallback
    let ocrResult;
    try {
      ocrResult = await ocrFromFile(imagePath);
    } catch {
      ocrResult = await ocrWithTesseract(imagePath);
    }

    if (ocrResult.IsErroredOnProcessing) {
      throw new Error('OCR failed');
    }

    let extractedText = ocrResult.ParsedResults[0]?.ParsedText || '';
    extractedText = extractedText.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ').trim();
    const tokens = extractedText.split(/\s+/);

    console.log('🧠 Tokens:', tokens);

    // Step 2: Find first token that matches an image in Supabase
    let foundImageUrl = null;
    let matchedToken = null;

    for (const token of tokens) {
      if (token.length < 3) continue;
      const url = await getPublicUrlForToken(token);
      if (url) {
        foundImageUrl = url;
        matchedToken = token;
        break;
      }
    }

    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); // delete temp file
    }

    if (!foundImageUrl) {
      return res.status(404).json({
        success: false,
        message: 'No matching image found in Supabase for detected text',
      });
    }

    const base64Image = await getBase64FromUrl(foundImageUrl);

    return res.json({
      success: true,
      detectedWord: matchedToken,
      base64Image,
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
