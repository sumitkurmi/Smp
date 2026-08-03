const { Server } = require("socket.io");

let io = null;
// Track online user ids
const onlineUsers = new Set();

const initSocket = (server, corsOptions) => {
	io = new Server(server, {
		pingTimeout: 60000,
		transports: ["websocket"],
		cors: corsOptions,
	});

	io.on("connection", (socket) => {
		console.log("New socket connection:", socket.id);

		socket.on("setup", (userId) => {
			socket.join(userId);
			// Track presence
			if (userId) {
				onlineUsers.add(userId.toString());
				socket.userId = userId.toString();
				// Broadcast to all (frontend filters by mentor-only)
				io.emit("user online", userId.toString());
				// Send current online list to the newly connected user
				socket.emit("online users", Array.from(onlineUsers));
			}
			console.log(`User ${userId} connected`);
			socket.emit("connected");
		});

		socket.on("join chat", (roomId) => {
			socket.join(roomId);
			console.log(`User joined chat room: ${roomId}`);
		});

		socket.on("new message", (newMessage) => {
			const chat = newMessage.chat;
			if (!chat?.users) return;

			chat.users.forEach((user) => {
				if (user._id === newMessage.sender._id) return;
				socket.in(user._id).emit("message received", newMessage);
			});
		});

		// Broadcast reaction update to everyone in the chat
		socket.on("react message", (payload) => {
			const chat = payload?.chat;
			if (!chat?.users) return;
			chat.users.forEach((user) => {
				if (user._id === payload?.sender?._id) return;
				socket.in(user._id).emit("message reacted", payload);
			});
		});

		socket.on("typing", (roomId) => socket.in(roomId).emit("typing"));
		socket.on("stop typing", (roomId) => socket.in(roomId).emit("stop typing"));

		socket.on("disconnect", () => {
			if (socket.userId) {
				onlineUsers.delete(socket.userId);
				io.emit("user offline", socket.userId);
			}
			console.log("User disconnected:", socket.id);
			socket.removeAllListeners();
		});
	});

	return io;
};

const getIO = () => {
	if (!io) {
		throw new Error("Socket.io has not been initialized!");
	}
	return io;
};

module.exports = { initSocket, getIO };