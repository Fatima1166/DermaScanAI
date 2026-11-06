const axios = require('axios');
const FormData = require('form-data');

async function performOCRSpace(apiKey, imageBase64) {
  try {
    const formData = new FormData();
    formData.append('apikey', apiKey);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', '2');
    formData.append('base64Image', imageBase64);

    const response = await axios.post('https://api.ocr.space/parse/image', formData, {
      headers: {
        ...formData.getHeaders(),
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    const data = response.data;
    
    if (data.IsErroredOnProcessing) {
      console.error('OCR.space error:', data.ErrorMessage);
      return { text: null, provider: 'ocr.space', confidence: 0 };
    }

    const extractedText = data.ParsedResults?.[0]?.ParsedText || '';
    
    const confidence = extractedText.length > 100 ? 0.9 : 
                      extractedText.length > 50 ? 0.7 : 
                      extractedText.length > 20 ? 0.5 : 0.3;
    
    return { 
      text: extractedText.trim(), 
      provider: 'ocr.space',
      confidence 
    };
  } catch (error) {
    console.error('OCR.space exception:', error);
    return { text: null, provider: 'ocr.space', confidence: 0 };
  }
}

async function performFallbackOCR(apiKey, imageBase64) {
  try {
    const formData = new FormData();
    formData.append('apikey', apiKey);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', '1');
    formData.append('base64Image', imageBase64);

    const response = await axios.post('https://api.ocr.space/parse/image', formData, {
      headers: {
        ...formData.getHeaders(),
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    const data = response.data;
    
    if (data.IsErroredOnProcessing) {
      return { text: null, provider: 'fallback', confidence: 0 };
    }

    const extractedText = data.ParsedResults?.[0]?.ParsedText || '';
    const confidence = extractedText.length > 50 ? 0.6 : 0.3;
    
    return { 
      text: extractedText.trim(), 
      provider: 'fallback',
      confidence 
    };
  } catch (error) {
    console.error('Fallback OCR exception:', error);
    return { text: null, provider: 'fallback', confidence: 0 };
  }
}

async function performGeminiVisionOCR(imageBase64) {
  try {
    const geminiKey = process.env.GROQ_API_KEY;
    if (!geminiKey) return { text: null, provider: 'gemini-vision', confidence: 0 };

    let mimeType = 'image/jpeg';
    let cleanBase64 = imageBase64;
    if (imageBase64 && imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      const mimeMatch = parts[0].match(/data:(.*?)$/);
      if (mimeMatch) mimeType = mimeMatch[1];
      cleanBase64 = parts[1];
    }

    const models = ['gemini-3.1-flash-lite', 'gemini-2.5-flash-lite', 'gemini-flash-latest'];
    for (const model of models) {
      try {
        console.log(`👁️ [Gemini Vision] Attempting extraction with ${model}...`);
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: 'You are an OCR and ingredients extractor. Read all ingredients listed on this skincare, cosmetics, or medicine product. Return ONLY the list of ingredients separated by commas. Do not include introductory text, bullet numbers, or disclaimers.'
                  },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: cleanBase64
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1000
            }
          },
          { timeout: 20000 }
        );

        const extractedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        if (extractedText && extractedText.length > 10 && !extractedText.toUpperCase().includes('NO_INGREDIENTS')) {
          console.log(`✅ [Gemini Vision] Successfully extracted ingredients (${extractedText.length} chars)`);
          return {
            text: extractedText,
            provider: 'gemini-vision',
            confidence: 0.95
          };
        }
      } catch (err) {
        console.error(`Gemini Vision (${model}) error:`, err.message);
      }
    }
    return { text: null, provider: 'gemini-vision', confidence: 0 };
  } catch (error) {
    console.error('Gemini Vision exception:', error.message);
    return { text: null, provider: 'gemini-vision', confidence: 0 };
  }
}

async function performOCR(apiKey, imageBase64) {
  let result = await performOCRSpace(apiKey, imageBase64);
  
  if (!result.text || result.text.length < 20) {
    console.log('🔄 OCR.space unavailable or failed. Switching to Gemini Vision fallback...');
    const visionResult = await performGeminiVisionOCR(imageBase64);
    if (visionResult.text && visionResult.text.length >= 10) {
      return visionResult;
    }

    result = await performFallbackOCR(apiKey, imageBase64);
  }
  
  return result;
}

module.exports = {
  performOCR
};