const multer = require('multer')
const path = require('path')
const fs = require('fs')
const ApiError = require('../utils/ApiError')

const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.docx', '.doc', '.ppt', '.pptx', '.png', '.jpg', '.jpeg']
  const ext = path.extname(file.originalname).toLowerCase()
  
  if (!allowedExts.includes(ext)) {
    return cb(new ApiError('Invalid file type. Supported types: PDF, DOC/DOCX, PPT/PPTX, PNG, JPG/JPEG.', 400), false)
  }

  cb(null, true)
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  }
})

module.exports = upload
