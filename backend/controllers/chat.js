const Chat = require("../models/chat");
const Message = require("../models/message");
const Attendance = require("../models/attendance");
const { getIO } = require("../socket");

const postChat = async (req, res) => {
	const { userId } = req.body;
	if (!userId) {
		return res.status(400).json({ message: "userId not provide" });
	}
	const existingChat = await Chat.find({
		isGroupChat: false,
		$and: [
			{ users: { $elemMatch: { $eq: req.user._id } } },
			{ users: { $elemMatch: { $eq: userId } } },
		],
	})
		.populate("users", "-password")
		.populate({
			path: "latestMessage",
			populate: {
				path: "sender",
				select: "-password",
			},
		});

	if (existingChat.length == 0) {
		const chatName = "Messenger";
		const isGroupChat = false;
		const users = [req.user._id, userId];
		const chat = await Chat.create({
			chatName,
			isGroupChat,
			users,
		});
		const chatAll = await Chat.findOne({ _id: chat._id }).populate(
			"users",
			"-password"
		);
		return res.status(200).json({ data: chatAll });
	} else {
		const chat = existingChat[0];
		return res.status(200).json({ data: chat });
	}
};
const getChat = async (req, res) => {
	const chat = await Chat.find({
		users: { $elemMatch: { $eq: req.user._id } },
	})
		.sort({ updatedAt: -1 })
		.populate("users", "-password")
		.populate({
			path: "latestMessage",
			populate: {
				path: "sender",
				select: "-password",
			},
		})
.populate("groupAdmin", "-password")
		.populate('meetings');
	return res.status(200).json({ data: chat });
};
const createGroup = async (req, res) => {
	if (req.user.accountType !== 'mentor') {
		return res.status(403).json({ message: "Only mentors can create groups" });
	}
	if (!req.body.users || !req.body.name) {
		return res.status(400).json({ message: "users and name not provide" });
	}
	const users = req.body.users;
	const studentIds = users
		.filter((u) => u.accountType === 'student')
		.map((u) => u._id);
	if (studentIds.length < 2) {
		return res.status(400).json({ message: "Select at least two students for group" });
	}
	studentIds.push(req.user._id);
	const groupChat = await Chat.create({
		chatName: req.body.name,
		isGroupChat: true,
		users: studentIds,
		groupAdmin: req.user._id,
	});
	const groups = await Chat.findOne({ _id: groupChat._id })
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
	res.status(200).json({ data: groups });
};
const deleteGroup = async (req, res) => {
	const chatId = req.params.chatId;
	await Message.deleteMany({ chat: chatId });
	await Chat.deleteOne({ _id: chatId });
	return res.status(200).json({ message: "success" });
};
const renameGroup = async (req, res) => {
	const { name, chatId } = req.body;
	if (!name || !chatId) {
		return res.status(400).json({ message: "name and chatId not provide" });
	}
	const chat = await Chat.findByIdAndUpdate(
		chatId,
		{ chatName: name },
		{ new: true }
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
	if (!chat) {
		return res.status(200).json({ message: "chat not found" });
	} else {
		return res.status(200).json({ data: chat });
	}
};
const removeFromGroup = async (req, res) => {
	const { chatId, userId } = req.body;
	if (!chatId || !userId) {
		return res
			.status(400)
			.json({ message: "chatId and userId not provide" });
	}
	const chat = await Chat.findByIdAndUpdate(
		chatId,
		{ $pull: { users: userId } },
		{ new: true }
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
	if (!chat) {
		return res.status(200).json({ message: "chat not found" });
	} else {
		return res.status(200).json({ data: chat });
	}
};
const addToGroup = async (req, res) => {
	const { chatId, userId } = req.body;
	if (!chatId || !userId) {
		return res
			.status(400)
			.json({ message: "chatId and userId not provide" });
	}
	const chat = await Chat.findByIdAndUpdate(
		chatId,
		{ $push: { users: userId } },
		{ new: true }
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
	if (!chat) {
		return res.status(200).json({ message: "chat not found" });
	} else {
		return res.status(200).json({ data: chat });
	}
};

const addMentor = async (req, res) => {
	const { chatId, userId } = req.body;
	if (!chatId || !userId) {
		return res.status(400).json({ message: "chatId and userId are required" });
	}
	const chat = await Chat.findById(chatId);
	if (!chat) {
		return res.status(404).json({ message: "Group not found" });
	}
	const isCurrentMentor = chat.groupAdmin?.toString() === req.user._id.toString() || (Array.isArray(chat.mentors) && chat.mentors.some((mentorId) => mentorId.toString() === req.user._id.toString())) || req.user.accountType === 'admin';
	if (!isCurrentMentor) {
		return res.status(403).json({ message: "Only the current mentor can add mentors" });
	}
	if (!chat.users.some((memberId) => memberId.toString() === userId)) {
		return res.status(400).json({ message: "Selected user is not a member of this group" });
	}
	const alreadyMentor = chat.groupAdmin?.toString() === userId || (Array.isArray(chat.mentors) && chat.mentors.some((memberId) => memberId.toString() === userId));
	if (alreadyMentor) {
		return res.status(400).json({ message: "This user is already a mentor" });
	}
	const updatedChat = await Chat.findByIdAndUpdate(
		chatId,
		{ $addToSet: { mentors: userId } },
		{ new: true }
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
	return res.status(200).json({ data: updatedChat });
};

const scheduleMeeting = async (req, res) => {
	const { chatId, title, scheduledAt } = req.body;
	if (!chatId || !title || !scheduledAt) {
		return res.status(400).json({ message: "chatId, title and scheduledAt are required" });
	}
	const chat = await Chat.findById(chatId);
	if (!chat) {
		return res.status(404).json({ message: "Group not found" });
	}
	const isMentor = req.user.accountType === 'mentor' || chat.groupAdmin?.toString() === req.user._id.toString() || req.user.accountType === 'admin';
	if (!isMentor) {
		return res.status(403).json({ message: "Only the group mentor can schedule meetings" });
	}
	const existingChat = await Chat.findById(chatId).populate('users', '-password');
	const attendance = await Attendance.create({
		chat: chatId,
		meetingTitle: title,
		scheduledAt,
		createdBy: req.user._id,
		records: existingChat.users.map((user) => ({ student: user._id, status: 'pending' })),
	});

	// Add meeting to chat's meetings array
	await Chat.findByIdAndUpdate(chatId, { $addToSet: { meetings: attendance._id } });

	// Emit socket notification to all group members
	const io = getIO();
	const notificationPayload = {
		meetingId: attendance._id,
		chatId,
		chatName: chat.chatName,
		meetingTitle: title,
		scheduledAt,
		createdBy: req.user._id,
		mentorName: req.user.firstName ? `${req.user.firstName} ${req.user.lastName || ""}`.trim() : req.user.email,
	};
	const userIds = Array.from(new Set(chat.users.map((user) => user.toString())));
	userIds.forEach((userId) => {
		io.to(userId).emit("meeting scheduled", notificationPayload);
	});

	return res.status(200).json({ data: attendance });
};

const getMeetings = async (req, res) => {
	const { chatId } = req.params;
	const meetings = await Attendance.find({ chat: chatId })
		.populate('records.student', '-password')
		.populate('createdBy', '-password')
		.sort({ scheduledAt: 1 });
	return res.status(200).json({ data: meetings });
};

const updateAttendance = async (req, res) => {
	const { meetingId, studentId, status } = req.body;
	if (!meetingId || !studentId || !status) {
		return res.status(400).json({ message: "meetingId, studentId and status are required" });
	}
	const meeting = await Attendance.findById(meetingId);
	if (!meeting) {
		return res.status(404).json({ message: "Meeting not found" });
	}
	const chat = await Chat.findById(meeting.chat);
	if (chat.groupAdmin?.toString() !== req.user._id.toString() && req.user.accountType !== 'admin') {
		return res.status(403).json({ message: "Only the group mentor can mark attendance" });
	}
	meeting.records = meeting.records.map((record) => {
		if (record.student.toString() === studentId) {
			return { ...record.toObject(), status, markedAt: new Date() };
		}
		return record;
	});
	await meeting.save();

	await meeting.populate("records.student", "-password");
	const updatedRecord = meeting.records.find((record) => record.student._id.toString() === studentId.toString());
	const studentName = updatedRecord?.student?.name || `${updatedRecord?.student?.firstName || ""} ${updatedRecord?.student?.lastName || ""}`.trim() || updatedRecord?.student?.email || "Student";
	const io = getIO();
	const notificationPayload = {
		meetingId: meeting._id,
		chatId: chat._id,
		meetingTitle: meeting.meetingTitle,
		studentId,
		status,
		studentName,
		scheduledAt: meeting.scheduledAt,
		updatedBy: req.user.name || req.user.email || "Mentor",
	};
	const userIds = Array.from(new Set(chat.users.map((user) => user.toString())));
	userIds.forEach((userId) => {
		io.to(userId).emit("attendance updated", notificationPayload);
	});

	return res.status(200).json({ data: meeting });
};

module.exports = {
	postChat,
	getChat,
	createGroup,
	deleteGroup,
	renameGroup,
	removeFromGroup,
	addToGroup,
	addMentor,
	scheduleMeeting,
	getMeetings,
	updateAttendance,
};
