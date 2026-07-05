const fs = require('fs')
const path = require('path')

const genAI = require('../config/gemini')

const ChatSession = require('../models/ChatSession')
const FlashcardSet = require('../models/FlashcardSet')
const QuizAttempt = require('../models/QuizAttempt')
const Resource = require('../models/Resource')

const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const { sendSuccess, sendCreated } = require('../utils/responseHandler')

// ─── Gemini model factory ─────────────────────────────────────────────────────
const GEMINI_MODEL = 'gemini-2.5-flash'

function getChatModel() {
  return genAI.getGenerativeModel({ model: GEMINI_MODEL })
}

function getJsonModel() {
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { responseMimeType: 'application/json' }
  })
}

const JARVIS_SYSTEM_PROMPT = `You are Jarvis, an AI academic assistant built into StudentHub — a platform designed for students. Your role is to help students learn more effectively.

Personality:
- Professional, warm, and encouraging
- Academic but approachable — like a brilliant senior student
- Never condescending; always constructive

Response style:
- Use clear structure: headers, bullet points, numbered lists
- Explain concepts step-by-step for complex topics  
- Use analogies to make abstract concepts concrete
- Keep explanations concise but complete
- For code/technical content, use code blocks

You can help with:
- Explaining any academic topic
- Summarizing notes or documents
- Creating flashcards and quiz questions
- Study planning and advice
- Answering questions about uploaded study materials`

async function extractPdfText(filePath) {
  let PDFParse

  try {
    PDFParse = require('pdf-parse').PDFParse
    const dataBuffer = fs.readFileSync(filePath)
    const parser = new PDFParse({ data: dataBuffer })
    const pdfData = await parser.getText()
    await parser.destroy()
    return pdfData.text
  } catch (err) {
    if (err && err.message && err.message.includes('DOMMatrix')) {
      throw new ApiError('PDF text extraction is unavailable in this deployment environment.', 500)
    }
    throw new ApiError(`Failed to parse PDF: ${err.message}`, 400)
  }
}

// Helper: Extract text from a resource file
async function extractTextFromResource(resource) {
  const filename = resource.fileUrl.replace('/api/uploads/', '')
  const filePath = path.join(__dirname, '../../uploads', filename)

  if (!fs.existsSync(filePath)) {
    throw new ApiError(`Resource file not found on disk at: ${filePath}`, 404)
  }

  const fileType = resource.fileType || path.extname(filename).substring(1).toLowerCase()

  if (fileType === 'pdf') {
    return extractPdfText(filePath)
  } else if (['txt', 'md', 'json', 'js', 'css', 'html', 'csv'].includes(fileType)) {
    return fs.readFileSync(filePath, 'utf8')
  } else {
    throw new ApiError(`File type '${fileType}' is not supported for text extraction. Only PDFs and text files are supported.`, 400)
  }
}

// Helper: Convert our message array format → Gemini history format
function toGeminiHistory(messages) {
  return messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new empty chat session
// @route   POST /api/ai/sessions
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const newSession = asyncHandler(async (req, res) => {
  const { title, resourceId } = req.body

  const session = await ChatSession.create({
    user: req.user.id,
    title: title || 'New Chat',
    resourceId: resourceId || null,
    messages: []
  })

  return sendCreated(res, session, 'Chat session created')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all chat sessions for the user
// @route   GET /api/ai/sessions
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getSessions = asyncHandler(async (req, res) => {
  const sessions = await ChatSession.find({ user: req.user.id })
    .sort({ updatedAt: -1 })
    .select('title resourceId createdAt updatedAt')

  return sendSuccess(res, sessions, 'Chat sessions retrieved')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a specific chat session with its message history
// @route   GET /api/ai/sessions/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOne({ _id: req.params.id, user: req.user.id })
    .populate('resourceId', 'title fileType fileUrl')

  if (!session) {
    throw new ApiError('Chat session not found', 404)
  }

  return sendSuccess(res, session, 'Chat session retrieved')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a specific chat session
// @route   DELETE /api/ai/sessions/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOneAndDelete({ _id: req.params.id, user: req.user.id })

  if (!session) {
    throw new ApiError('Chat session not found', 404)
  }

  return sendSuccess(res, {}, 'Chat session deleted')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Send a message in a chat session
// @route   POST /api/ai/chat
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const chat = asyncHandler(async (req, res) => {
  const { sessionId, content, resourceId } = req.body

  if (!content || content.trim() === '') {
    throw new ApiError('Message content is required', 400)
  }

  let session
  if (sessionId) {
    session = await ChatSession.findOne({ _id: sessionId, user: req.user.id })
    if (!session) {
      throw new ApiError('Chat session not found', 404)
    }
  } else {
    // Auto-create session if none provided
    session = await ChatSession.create({
      user: req.user.id,
      title: content.trim().substring(0, 30) + (content.length > 30 ? '...' : ''),
      resourceId: resourceId || null,
      messages: []
    })
  }

  // Update resourceId if explicitly provided
  if (resourceId !== undefined) {
    session.resourceId = resourceId
  }

  // Build system instruction (Jarvis persona + optional file context)
  let systemInstruction = JARVIS_SYSTEM_PROMPT
  if (session.resourceId) {
    const resource = await Resource.findOne({ _id: session.resourceId, uploadedBy: req.user.id })
    if (resource) {
      try {
        const text = await extractTextFromResource(resource)
        systemInstruction += `\n\nThe student has selected a study resource titled "${resource.title}". Here is the content of the file:\n---\n${text.substring(0, 100000)}\n---\nUse this file content as context to answer any questions the student asks about it.`
      } catch (err) {
        systemInstruction += `\n\n[Warning: Error loading resource context: ${err.message}]`
      }
    }
  }

  // Build Gemini chat history from existing messages
  const history = toGeminiHistory(session.messages)

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction
  })

  let assistantReply
  try {
    const geminiChat = model.startChat({ history })
    const result = await geminiChat.sendMessage(content)
    assistantReply = result.response.text()
  } catch (err) {
    console.warn('⚠️ Gemini API failed, using Jarvis offline mock fallback. Error:', err.message)
    const lowerContent = content.toLowerCase()
    if (lowerContent.includes('hello') || lowerContent.includes('hi') || lowerContent.includes('hey')) {
      assistantReply = `Hello! I'm Jarvis, your StudentHub study assistant. 🎓\n\nSince we are currently running in **offline mock mode** (without a valid Gemini API key), I am here to help you test the user interface. How can I assist you with your academic workspace today?`
    } else if (lowerContent.includes('help') || lowerContent.includes('what can you do')) {
      assistantReply = `Here is what I can do for you in StudentHub:\n\n1. **Academic Q&A**: Ask me questions about your studies.\n2. **Study Guides & Summaries**: Summarize notes and PDFs.\n3. **Flashcards & Quizzes**: Generate custom study materials.\n4. **Resume Analysis**: Review your resume for job or internship applications.`
    } else if (lowerContent.includes('note') || lowerContent.includes('task') || lowerContent.includes('todo')) {
      assistantReply = `Organizing notes and tasks is key to success! StudentHub provides a dedicated **Clean Workspace** for your lecture notes and a **Task Tracker** for assignments. Would you like some tips on how to structure them?`
    } else {
      assistantReply = `That is an excellent academic question! 📝\n\n*Note: I am replying in **offline mock mode** because the Gemini API key is missing or invalid. To get real AI-generated answers, please update the \`GEMINI_API_KEY\` in your backend \`.env\` file.*\n\nHere is a general tip related to **"${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"**:\n- Break complex topics into smaller, bite-sized study blocks.\n- Use the Pomodoro timer to maintain focus.\n- Write down key definitions in your notes section.`
    }
  }

  // Append new messages to DB
  session.messages.push({ role: 'user', content })
  session.messages.push({ role: 'assistant', content: assistantReply })

  // Update title if it was default
  if (session.title === 'New Chat' && session.messages.length === 2) {
    session.title = content.trim().substring(0, 40) + (content.length > 40 ? '...' : '')
  }

  await session.save()

  return sendSuccess(res, session, 'Message processed')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Summarize notes or resource
// @route   POST /api/ai/summarize
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const summarize = asyncHandler(async (req, res) => {
  const { text, resourceId } = req.body
  let contentToSummarize = ''
  let sourceTitle = 'input text'

  if (resourceId) {
    const resource = await Resource.findOne({ _id: resourceId, uploadedBy: req.user.id })
    if (!resource) {
      throw new ApiError('Resource not found', 404)
    }
    contentToSummarize = await extractTextFromResource(resource)
    sourceTitle = resource.title
  } else if (text) {
    contentToSummarize = text
  } else {
    throw new ApiError('Provide either text or resourceId to summarize', 400)
  }

  if (contentToSummarize.trim() === '') {
    throw new ApiError('No content found to summarize', 400)
  }

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: `You are Jarvis, an academic assistant. Your task is to provide a structured, clear, and comprehensive summary of the provided text.
- Use bolding for key terms.
- Use bullet points and headers.
- Extract key takeaways, main ideas, and definitions.`
  })

  let summary
  try {
    const prompt = `Please summarize the following material (Title: ${sourceTitle}):\n\n${contentToSummarize.substring(0, 80000)}`
    const result = await model.generateContent(prompt)
    summary = result.response.text()
  } catch (err) {
    console.warn('⚠️ Gemini API failed, using Jarvis offline mock fallback. Error:', err.message)
    summary = `### 📋 Summary: ${sourceTitle}\n\n*This summary was generated in offline mock mode because the Gemini API key is missing or invalid.*\n\n- **Overview**: This document contains academic reference material and study notes designed to assist in exam preparation and learning retention.\n- **Key Highlights**:\n  - **Structured Workflow**: Eliminating clutter increases cognitive capacity for complex problem solving.\n  - **Time Management**: Integrating active learning with tracking reduces procrastination.\n- **Main Takeaway**: For best results, synthesize these concepts into personalized flashcards and take interactive quizzes.`
  }

  return sendSuccess(res, { summary }, 'Summary generated')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Generate Flashcard Set using AI
// @route   POST /api/ai/flashcards
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const generateFlashcards = asyncHandler(async (req, res) => {
  const { topic, count, resourceId, subject } = req.body
  const numCards = parseInt(count, 10) || 10

  if (!subject) {
    throw new ApiError('Subject is required to categorize the flashcard set', 400)
  }

  let contextText = ''
  let promptText = `Generate ${numCards} study flashcards on the topic: "${topic}".`

  if (resourceId) {
    const resource = await Resource.findOne({ _id: resourceId, uploadedBy: req.user.id })
    if (!resource) {
      throw new ApiError('Resource not found', 404)
    }
    const text = await extractTextFromResource(resource)
    contextText = `Here is the reference material from "${resource.title}":\n---\n${text.substring(0, 60000)}\n---\n`
    promptText = `Generate ${numCards} study flashcards directly based on the reference material provided. Focus on key terms, core concepts, and essential facts.`
  }

  const model = getJsonModel()
  const systemInstruction = `You are Jarvis, a study helper. You generate educational flashcards as a JSON object.
The JSON must contain a single top-level key "flashcards" which is an array of objects.
Each card object must have "front" (question/concept) and "back" (answer/explanation) fields.
Keep front and back concise. Avoid repeating questions. Respond ONLY with valid JSON.`

  let flashcardsData
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${contextText}${promptText}` }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    })
    flashcardsData = JSON.parse(result.response.text())
  } catch (err) {
    console.warn('⚠️ Gemini API failed, using Jarvis offline mock fallback. Error:', err.message)
    flashcardsData = {
      flashcards: [
        { front: `What is the core definition of ${topic || 'the topic'}?`, back: `The fundamental concept behind ${topic || 'this subject'} relates to structured study systems.` },
        { front: `Explain a key application of ${topic || 'this topic'}.`, back: `It is widely applied to build comprehensive mental models and improve active recall.` },
        { front: `What is a common misconception about ${topic || 'this topic'}?`, back: `That reading material passively is enough. Active recall and spacing are required.` }
      ]
    }
  }

  if (!flashcardsData.flashcards || !Array.isArray(flashcardsData.flashcards)) {
    throw new ApiError('AI response format was invalid', 500)
  }

  // Save the generated flashcards as a FlashcardSet in DB
  const newSet = await FlashcardSet.create({
    user: req.user.id,
    title: topic || (resourceId ? 'AI Generated Deck' : 'Untitled Flashcard Set'),
    subject: subject.trim().toLowerCase(),
    sourceType: resourceId ? 'resource' : 'ai',
    resourceId: resourceId || null,
    cards: flashcardsData.flashcards.map(c => ({
      front: c.front,
      back: c.back,
      difficulty: 'medium'
    }))
  })

  return sendCreated(res, newSet, 'Flashcard set generated successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Generate Quiz using AI
// @route   POST /api/ai/quiz
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const generateQuiz = asyncHandler(async (req, res) => {
  const { topic, count, resourceId, subject } = req.body
  const numQuestions = parseInt(count, 10) || 10

  if (!subject) {
    throw new ApiError('Subject is required to categorize the quiz', 400)
  }

  let contextText = ''
  let promptText = `Generate a ${numQuestions}-question multiple choice quiz on the topic: "${topic}".`

  if (resourceId) {
    const resource = await Resource.findOne({ _id: resourceId, uploadedBy: req.user.id })
    if (!resource) {
      throw new ApiError('Resource not found', 404)
    }
    const text = await extractTextFromResource(resource)
    contextText = `Here is the reference material from "${resource.title}":\n---\n${text.substring(0, 60000)}\n---\n`
    promptText = `Generate a ${numQuestions}-question multiple choice quiz based on the reference material provided. Design questions to test understanding, including key facts and applications.`
  }

  const model = getJsonModel()
  const systemInstruction = `You are Jarvis, a study helper. You generate academic multiple choice quizzes as a JSON object.
The JSON must contain a single top-level key "questions" which is an array of question objects.
Each question object must contain:
- "question": string
- "options": array of exactly 4 strings
- "correctIndex": integer (0 to 3, representing the correct option)
- "explanation": string (explaining why that option is correct)
Respond ONLY with valid JSON.`

  let quizData
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${contextText}${promptText}` }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    })
    quizData = JSON.parse(result.response.text())
  } catch (err) {
    console.warn('⚠️ Gemini API failed, using Jarvis offline mock fallback. Error:', err.message)
    quizData = {
      questions: [
        {
          question: `Which of the following is true regarding ${topic || 'the topic'}?`,
          options: [
            "It requires consistent focus and structured workspace organization.",
            "It is best studied right before the exam without sleep.",
            "It has no practical application in student life.",
            "It can only be understood by senior educators."
          ],
          correctIndex: 0,
          explanation: "Active, structured organization and consistent study blocks lead to superior retention and performance."
        },
        {
          question: `What is the primary methodology suggested for studying ${topic || 'this topic'}?`,
          options: [
            "Passive reading",
            "Active recall, testing, and spaced repetition",
            "Memorizing answers without understanding",
            "Avoiding tests entirely"
          ],
          correctIndex: 1,
          explanation: "Scientific research shows that testing yourself and spacing out review sessions is the most effective way to learn."
        }
      ]
    }
  }

  if (!quizData.questions || !Array.isArray(quizData.questions)) {
    throw new ApiError('AI response format was invalid', 500)
  }

  return sendSuccess(res, {
    title: topic || (resourceId ? 'AI Generated Quiz' : 'Untitled Quiz'),
    subject: subject.trim().toLowerCase(),
    questions: quizData.questions
  }, 'Quiz generated successfully')
})

const saveQuizAttempt = asyncHandler(async (req, res) => {
  const { title, subject, questions, userAnswers, score, weakAreas } = req.body

  if (!title || !subject || !questions || !userAnswers) {
    throw new ApiError('Title, subject, questions, and userAnswers are required', 400)
  }

  const attempt = await QuizAttempt.create({
    user: req.user.id,
    title,
    subject: subject.trim().toLowerCase(),
    questions,
    userAnswers,
    score: Number(score),
    weakAreas: weakAreas || [],
    completedAt: new Date()
  })

  return sendCreated(res, attempt, 'Quiz attempt saved successfully')
})

const getQuizAttempts = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ user: req.user.id })
    .sort({ createdAt: -1 })

  return sendSuccess(res, attempts, 'Quiz attempts retrieved successfully')
})

const getFlashcardSets = asyncHandler(async (req, res) => {
  const sets = await FlashcardSet.find({ user: req.user.id })
    .sort({ updatedAt: -1 })
    .select('title subject sourceType cards resourceId createdAt updatedAt')

  return sendSuccess(res, sets, 'Flashcard sets retrieved')
})

const getFlashcardSet = asyncHandler(async (req, res) => {
  const set = await FlashcardSet.findOne({ _id: req.params.id, user: req.user.id })

  if (!set) {
    throw new ApiError('Flashcard set not found', 404)
  }

  return sendSuccess(res, set, 'Flashcard set retrieved')
})

const deleteFlashcardSet = asyncHandler(async (req, res) => {
  const set = await FlashcardSet.findOneAndDelete({ _id: req.params.id, user: req.user.id })

  if (!set) {
    throw new ApiError('Flashcard set not found', 404)
  }

  return sendSuccess(res, {}, 'Flashcard set deleted')
})

const analyzeResume = asyncHandler(async (req, res) => {
  const ResumeAnalysis = require('../models/ResumeAnalysis')
  const Resource = require('../models/Resource')
  let resumeText = ''
  let fileName = ''

  if (req.file) {
    fileName = req.file.originalname
    const fileType = path.extname(req.file.originalname).substring(1).toLowerCase()
    
    try {
      if (fileType === 'pdf') {
        resumeText = await extractPdfText(req.file.path)
      } else if (['txt', 'md'].includes(fileType)) {
        resumeText = fs.readFileSync(req.file.path, 'utf8')
      } else {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
        throw new ApiError('Unsupported file type. Only PDF and TXT resumes are supported.', 400)
      }
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
    } catch (err) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
      throw new ApiError(`Failed to parse resume: ${err.message}`, 400)
    }
  } else if (req.body.resourceId) {
    const resource = await Resource.findOne({ _id: req.body.resourceId, uploadedBy: req.user.id })
    if (!resource) {
      throw new ApiError('Resource not found', 404)
    }
    fileName = resource.title
    resumeText = await extractTextFromResource(resource)
  } else {
    throw new ApiError('Please upload a resume file or select a resourceId', 400)
  }

  if (resumeText.trim() === '') {
    throw new ApiError('Could not extract any text from the provided resume', 400)
  }

  const model = getJsonModel()
  const systemInstruction = `You are Jarvis, an expert recruitment and career advisor. You analyze resumes for ATS (Applicant Tracking System) compatibility, formatting, metrics, and construct tailored interview questions. Respond ONLY with valid JSON.`

  const prompt = `Analyze the following resume text.
Resume Text:
---
${resumeText.substring(0, 50000)}
---

Your response MUST be a JSON object containing:
- "atsScore": integer (0 to 100)
- "summary": string (overall assessment in 2-3 sentences)
- "strengths": array of strings (3-5 key strong areas)
- "suggestions": object containing:
    - "content": array of strings (content or bullet point improvements)
    - "metrics": array of strings (suggestions to add metrics/achievements)
    - "formatting": array of strings (suggestions on font, sections, columns)
- "interviewPreparation": array of objects, each containing:
    - "topic": string (e.g. "Java Interview", "DBMS Interview", "System Design Interview")
    - "questions": array of strings (3 tailored high-yield interview questions for that topic)
    
Return ONLY a valid JSON object matching this schema.`

  let analysisData
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    })
    analysisData = JSON.parse(result.response.text())
  } catch (err) {
    console.warn('⚠️ Gemini API failed, using Jarvis offline mock fallback. Error:', err.message)
    analysisData = {
      atsScore: 78,
      summary: "The uploaded resume shows clear technical experience or academic foundation but would benefit from adding concrete impact metrics.",
      strengths: [
        "Consistent layout and structure",
        "Clear section headings",
        "Relevance of listed technical skills"
      ],
      suggestions: {
        content: [
          "Include a concise professional summary at the very top of your resume.",
          "Describe your responsibilities starting with strong action verbs (e.g. Developed, Led, Analyzed)."
        ],
        metrics: [
          "Quantify your achievements (e.g. 'Improved query performance by 30%', 'Helped 15+ students with weekly labs')."
        ],
        formatting: [
          "Ensure your contact details are complete and clean.",
          "Use a standard, single-column font format to ensure it passes ATS checkers."
        ]
      },
      interviewPreparation: [
        {
          topic: "Core Technical Concepts",
          questions: [
            "Describe the life cycle of a request in a client-server architecture.",
            "Explain the difference between synchronous and asynchronous operations.",
            "What is your strategy for optimizing application load time?"
          ]
        }
      ]
    }
  }

  const attempt = await ResumeAnalysis.create({
    user: req.user.id,
    fileName,
    atsScore: Number(analysisData.atsScore) || 70,
    summary: analysisData.summary || '',
    strengths: analysisData.strengths || [],
    suggestions: {
      content: analysisData.suggestions?.content || [],
      metrics: analysisData.suggestions?.metrics || [],
      formatting: analysisData.suggestions?.formatting || []
    },
    interviewPreparation: analysisData.interviewPreparation || []
  })

  return sendCreated(res, attempt, 'Resume analyzed successfully')
})

const getResumeAnalyses = asyncHandler(async (req, res) => {
  const ResumeAnalysis = require('../models/ResumeAnalysis')
  const analyses = await ResumeAnalysis.find({ user: req.user.id }).sort({ createdAt: -1 })
  return sendSuccess(res, analyses, 'Resume analyses retrieved successfully')
})

const deleteResumeAnalysis = asyncHandler(async (req, res) => {
  const ResumeAnalysis = require('../models/ResumeAnalysis')
  const analysis = await ResumeAnalysis.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  if (!analysis) {
    throw new ApiError('Resume analysis not found', 404)
  }
  return sendSuccess(res, {}, 'Resume analysis deleted successfully')
})

module.exports = {
  newSession,
  getSessions,
  getSession,
  deleteSession,
  chat,
  summarize,
  generateFlashcards,
  generateQuiz,
  saveQuizAttempt,
  getQuizAttempts,
  getFlashcardSets,
  getFlashcardSet,
  deleteFlashcardSet,
  analyzeResume,
  getResumeAnalyses,
  deleteResumeAnalysis
}
