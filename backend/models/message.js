const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    image_urls: [
      {
        type: String,
      },
    ],
    video_urls: [
      {
        type: String,
      },
    ],
    // New: generic files (PDF, DOCX, ZIP, etc.)
    files: [
      {
        url: { type: String },
        name: { type: String }, // original filename
      },
    ],
    // Reply-to: store the id and a short preview of the quoted message
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    replyPreview: {
      type: String,
      default: "",
    },
    // Reactions: emoji -> array of user ids who reacted
    reactions: {
      type: Map,
      of: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: {},
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
