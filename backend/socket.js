const { Server } = require("socket.io");

let io = null;

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

		socket.on("typing", (roomId) => socket.in(roomId).emit("typing"));
		socket.on("stop typing", (roomId) => socket.in(roomId).emit("stop typing"));

		socket.on("disconnect", () => {
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