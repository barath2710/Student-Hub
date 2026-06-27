const { GoogleGenerativeAI } = require('@google/generative-ai')

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey || apiKey.trim() === '') {
  console.warn('⚠️ WARNING: GEMINI_API_KEY is not defined in your backend/.env file.')
} else {
  console.log(`🔑 Gemini API key loaded: ${apiKey.substring(0, 18)}... (${apiKey.length} chars)`)
}

const genAI = new GoogleGenerativeAI(apiKey || 'dummy_key')

module.exports = genAI
