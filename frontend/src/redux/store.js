import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import conditionSlice from "./slices/conditionSlice";
import messageSlice from "./slices/messageSlice";
import myChatSlice from "./slices/myChatSlice";
import onlineSlice from "./slices/onlineSlice";

const store = configureStore({
	reducer: {
		auth: authSlice,
		condition: conditionSlice,
		myChat: myChatSlice,
		message: messageSlice,
		online: onlineSlice,
	},
});

export default store;
