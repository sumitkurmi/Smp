const Chat = require("../models/chat");
const Message = require("../models/message");

const createMessage = async (req, res) => {
    // Add files = [] to destructuring
    const { message, chatId, image_urls = [], video_urls = [], files = [], replyTo = null } = req.body;
    
    // Allow messages with media/files even if text is empty
    if (!message && image_urls.length === 0 && video_urls.length === 0 && files.length === 0) {
        return res.status(400).json({ message: "Message or media content is required" });
    }

    let replyPreview = "";
    if (replyTo) {
        try {
            const quoted = await Message.findById(replyTo).select("message replyPreview image_urls video_urls files");
            if (quoted) {
                replyPreview = quoted.message
                    || (quoted.image_urls?.length ? "📷 Image" : "")
                    || (quoted.video_urls?.length ? "🎬 Video" : "")
                    || (quoted.files?.length ? "📎 File" : "")
                    || "Replied message";
            }
        } catch (e) {
            replyPreview = "";
        }
    }

    try {
        const newMessage = await Message.create({
            sender: req.user._id,
            message: message || "", // Allow empty message if media exists
            chat: chatId,
            image_urls,
            video_urls,
            files, // Save generic files (PDF, DOCX, ZIP, etc.)
            replyTo,
            replyPreview,
        });

        // Update chat's latest message
        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: newMessage._id
        });

        // Populate response data (existing functionality preserved)
        const fullMessage = await Message.findById(newMessage._id)
            .populate("sender", "-password")
            .populate({
                path: "chat",
                populate: { 
                    path: "users groupAdmin", 
                    select: "-password" 
                }
            });

        return res.status(201).json({ data: fullMessage });

    } catch (error) {
        console.error("Error creating message:", error);
        return res.status(500).json({ 
            message: "Failed to create message",
            error: error.message 
        });
    }
};

const allMessage = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const messages = await Message.find({ chat: chatId })
            .populate("sender", "-password")
            .populate("chat")
            .sort({ createdAt: 1 }); // Preserve message order

        return res.status(200).json({ data: messages });

    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ 
            message: "Failed to retrieve messages",
            error: error.message 
        });
    }
};

const clearChat = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        await Message.deleteMany({ chat: chatId });
        return res.status(200).json({ message: "Chat history cleared successfully" });

    } catch (error) {
        console.error("Error clearing chat:", error);
        return res.status(500).json({ 
            message: "Failed to clear chat history",
            error: error.message 
        });
    }
};

// Toggle a reaction on a message
const toggleReaction = async (req, res) => {
    const { messageId, emoji } = req.body;
    if (!messageId || !emoji) {
        return res.status(400).json({ message: "messageId and emoji are required" });
    }

    try {
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        const reactions = message.reactions || new Map();
        const emojiKey = String(emoji);
        const existingUsers = reactions.get(emojiKey) || [];
        const userIndex = existingUsers.findIndex((id) => id.toString() === req.user._id.toString());

        let reaction;
        if (userIndex > -1) {
            // Remove reaction
            existingUsers.splice(userIndex, 1);
            if (existingUsers.length === 0) {
                reactions.delete(emojiKey);
            } else {
                reactions.set(emojiKey, existingUsers);
            }
            reaction = "removed";
        } else {
            // Add reaction
            reactions.set(emojiKey, [...existingUsers, req.user._id]);
            reaction = "added";
        }

        message.reactions = reactions;
        await message.save();

        const fullMessage = await Message.findById(message._id)
            .populate("sender", "-password")
            .populate("chat");

        return res.status(200).json({ data: fullMessage, reaction });
    } catch (error) {
        console.error("Error toggling reaction:", error);
        return res.status(500).json({
            message: "Failed to toggle reaction",
            error: error.message,
        });
    }
};

module.exports = { createMessage, allMessage, clearChat, toggleReaction };
