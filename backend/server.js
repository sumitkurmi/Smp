const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

// Enhanced CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
const PORT = process.env.PORT || 3000;

// Routes
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
const messageRouter = require("./routes/message");

// Database Connection
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connection established");
    } catch (err) {
        console.error("Database connection error:", err.message);
        console.warn("Continuing without a database connection; auth and chat routes will fail until MongoDB is reachable.");
    }
}

// Server endpoints
app.get("/", (req, res) => {
    res.json({
        status: "healthy",
        message: "Chat API Server",
        version: "1.0.0"
    });
});

// Route handlers
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

// Error handling
app.use((err, req, res, next) => {
    console.error("Server Error:", err.stack);
    res.status(500).json({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
    });
});

// 404 Handler
app.use("*", (req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});

// Start Server
async function startServer() {
    await connectDB();
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    // Socket.IO Configuration
    const { initSocket } = require("./socket");
    initSocket(server, corsOptions);
}

startServer().catch(err => {
    console.error("Server failed to start:", err);
    process.exit(1);
});
