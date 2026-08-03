import { createSlice } from "@reduxjs/toolkit";

const myChatSlice = createSlice({
	name: "myChat",
	initialState: {
		chat: [],
		selectedChat: null,
		newMessageRecieved: [],
		unreadCounts: {}, // chatId -> number
	},
	reducers: {
		addMyChat: (state, action) => {
			state.chat = action.payload;
		},
		incrementUnread: (state, action) => {
			const chatId = action.payload;
			if (chatId && state.selectedChat?._id !== chatId) {
				state.unreadCounts[chatId] = (state.unreadCounts[chatId] || 0) + 1;
			}
		},
		clearUnread: (state, action) => {
			const chatId = action.payload;
			if (chatId) {
				state.unreadCounts[chatId] = 0;
			}
		},
		resetUnread: (state) => {
			state.unreadCounts = {};
		},
		addSelectedChat: (state, action) => {
			state.selectedChat = action.payload;
			const newMessageRecieved = state.newMessageRecieved.filter(
				(message) => message.chat._id !== action.payload._id
			);
			state.newMessageRecieved = newMessageRecieved;
			if (action.payload?._id) {
				state.unreadCounts[action.payload._id] = 0;
			}
		},
		addNewChat: (state, action) => {
			const isExistChat = state.chat.find(
				(chat) => chat._id === action.payload._id
			);
			if (!isExistChat) {
				state.chat = [action.payload, ...state.chat];
			}
		},
		deleteSelectedChat: (state, action) => {
			if (
				state.selectedChat &&
				state.selectedChat._id === action.payload
			) {
				state.selectedChat = null;
			}
			const allChat = state.chat.filter(
				(chat) => chat._id !== action.payload
			);
			state.chat = allChat;
		},
		addNewMessageRecieved: (state, action) => {
			if (!state.newMessageRecieved.includes(action.payload)) {
				state.newMessageRecieved = [
					action.payload,
					...state.newMessageRecieved,
				];
			}
		},
removeNewMessageRecieved: (state, action) => {
			const newMessageRecieved = state.newMessageRecieved.filter(
				(message) => message.chat._id !== action.payload.chat._id
			);
			state.newMessageRecieved = newMessageRecieved;
		},
		addMeetingNotification: (state, action) => {
			const payload = action.payload;
			if (!payload) return;
			// Build a notification object that mirrors the message shape used by NotificationBox
			const notification = {
				_id: `meeting-${payload.meetingId}`,
				meeting: true,
				message: `New meeting scheduled: ${payload.meetingTitle}`,
				meetingTitle: payload.meetingTitle,
				scheduledAt: payload.scheduledAt,
				mentorName: payload.mentorName,
				createdAt: new Date().toISOString(),
				chat: {
					_id: payload.chatId,
					chatName: payload.chatName,
					isGroupChat: true,
				},
				sender: {
					firstName: payload.mentorName || "Mentor",
				},
			};
			if (
				!state.newMessageRecieved.some(
					(n) => n._id === notification._id
				)
			) {
				state.newMessageRecieved = [
					notification,
					...state.newMessageRecieved,
				];
			}
		},
	},
});

export const {
	addMyChat,
	addSelectedChat,
	addNewChat,
	deleteSelectedChat,
addNewMessageRecieved,
	removeNewMessageRecieved,
	addMeetingNotification,
	incrementUnread,
	clearUnread,
	resetUnread,
} = myChatSlice.actions;
export default myChatSlice.reducer;
