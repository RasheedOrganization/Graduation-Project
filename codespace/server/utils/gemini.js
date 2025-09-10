const fetch = require('node-fetch');

// Hardcoded API key for Gemini requests
const GEMINI_API_KEY = 'AIzaSyCxEUSKz296qV7qCFgNvRe_7jYMe9Y8LyI';

/**
 * Call the Gemini API with provided text and return parsed JSON response.
 * Throws an error when the request fails or the API responds with an error.
 */
async function callGemini(text) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}` , {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text }] }] })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${errorText}`);
  }
  return response.json();
}

/**
 * Extract plain text from a Gemini API response object.
 */
function extractText(data) {
  return data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts
    ? data.candidates[0].content.parts.map(p => p.text).join('')
    : 'No response';
}

module.exports = { callGemini, extractText };
