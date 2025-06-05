const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const Tesseract = require('tesseract.js');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kzhbzvkfpjftklzcydze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6aGJ6dmtmcGpmdGtsemN5ZHplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAzODM0MiwiZXhwIjoyMDY0NjE0MzQyfQ.2BkpY_vf1B6KiJ8X1ykQZVaS6qsdHjjHuB0NuRCy5d4';

const supabase = createClient(supabaseUrl, supabaseKey);

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

// Supabase Storage upload function
const uploadToSupabaseStorage = async (filePath, originalName) => {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = `uploads/${Date.now()}_${originalName}`; // folder + unique filename

  const { data, error } = await supabase.storage
    .from('medicine-images') // Your bucket name in Supabase Storage
    .upload(fileName, fileBuffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/jpeg', // better to detect mimetype dynamically if possible
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const { publicURL, error: urlError } = supabase.storage
    .from('medicine-images')
    .getPublicUrl(fileName);

  if (urlError) {
    throw urlError;
  }

  return publicURL;
};

// Main Controller
exports.analyzeImage = async (req, res) => {
  let imagePath;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    imagePath = req.file.path;

    // Step 1: OCR
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

    // Step 2: Upload image to Supabase Storage
    const imagePublicUrl = await uploadToSupabaseStorage(imagePath, req.file.originalname);
    console.log('📤 Uploaded image URL:', imagePublicUrl);

    // Step 3: Delete local temp file
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Step 4: Respond with OCR text and uploaded image URL
    return res.json({
      success: true,
      detectedText: cleanText,
      uploadedImageUrl: imagePublicUrl,
    });

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
