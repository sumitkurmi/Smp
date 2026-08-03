const express = require("express");
const router = express.Router();
const wrapAsync = require("../middlewares/wrapAsync");
const { authorization } = require("../middlewares/authorization");
const messageController = require("../controllers/message");
const uploadFiles = require("../controllers/upload");
const multer = require('multer');

// Multer config: allow any file type (images, videos, PDFs, etc.)
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Existing message routes (unchanged)
router.post("/", authorization, wrapAsync(messageController.createMessage));
router.get("/:chatId", authorization, wrapAsync(messageController.allMessage));
router.get(
  "/clearChat/:chatId",
  authorization,
  wrapAsync(messageController.clearChat)
);

// Reaction route (place before dynamic :chatId route patterns if needed)
router.post("/react", authorization, wrapAsync(messageController.toggleReaction));

// Upload route for any file type
router.post(
  "/upload",
  authorization, // Protect the upload route
  upload.array('file', 5), // Accept up to 5 files, field name 'file'
  wrapAsync(uploadFiles)
);

module.exports = router;
