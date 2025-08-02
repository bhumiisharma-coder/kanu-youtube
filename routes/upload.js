const express = require("express")
const multer = require("multer")
const { v2: cloudinary } = require("cloudinary")
const streamifier = require("streamifier")
const router = express.Router()

// Cloudinary Config
cloudinary.config({
  cloud_name: "dpo6qlmur",
  api_key: "244741112855841",
  api_secret: "yRH8Jv7hfbQvbXB46I_rfaCV4ZU",
})

// ✅ Multer with higher limits for large videos
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // ✅ 200MB limit (increased)
  },
})

// ✅ Video Upload with Compression Options
router.post("/video", upload.single("video"), (req, res) => {
  try {
    console.log("Video upload request received")

    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" })
    }

    const fileSizeMB = req.file.size / (1024 * 1024)
    console.log("File details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: `${fileSizeMB.toFixed(2)} MB`,
    })

    // ✅ Dynamic upload options based on file size
    const uploadOptions = {
      resource_type: "video",
      folder: "user_uploads/videos",
      quality: fileSizeMB > 50 ? "60" : "auto", // ✅ Compress large files
      fetch_format: "auto",
      // ✅ Automatic video optimization
      transformation:
        fileSizeMB > 50
          ? [
              { quality: "60", fetch_format: "auto" },
              { width: 1280, height: 720, crop: "limit" }, // ✅ Limit resolution for large files
            ]
          : [],
      chunk_size: 6000000, // ✅ 6MB chunks for better upload
    }

    console.log(`Using ${fileSizeMB > 50 ? "compressed" : "standard"} upload for ${fileSizeMB.toFixed(2)}MB file`)

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error)
        return res.status(500).json({ success: false, error: error.message })
      }

      console.log("Video uploaded successfully:", result.secure_url)
      res.status(200).json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        duration: result.duration,
        format: result.format,
        bytes: result.bytes,
        original_size: `${fileSizeMB.toFixed(2)} MB`,
        compressed: fileSizeMB > 50,
      })
    })

    streamifier.createReadStream(req.file.buffer).pipe(stream)
  } catch (err) {
    console.error("Upload route error:", err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ✅ Image Upload (unchanged)
router.post("/image", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" })
    }

    console.log("Image details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
    })

    const uploadOptions = {
      resource_type: "image",
      folder: "user_uploads/images",
      quality: "auto",
      fetch_format: "auto",
      transformation: [{ width: 1000, height: 1000, crop: "limit", quality: "auto" }],
    }

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        console.error("Cloudinary image upload error:", error)
        return res.status(500).json({ success: false, error: error.message })
      }

      console.log("Image uploaded successfully:", result.secure_url)
      res.status(200).json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        bytes: result.bytes,
      })
    })

    streamifier.createReadStream(req.file.buffer).pipe(stream)
  } catch (err) {
    console.error("Image upload route error:", err)
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
