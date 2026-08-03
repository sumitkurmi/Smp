import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name: "message",
    initialState: {
        message: [],
        newMessageId: "",
    },
    reducers: {
        addAllMessages: (state, action) => {
            state.message = action.payload;
        },
        addNewMessage: (state, action) => {
            state.message = [...state.message, action.payload];
        },
        addNewMessageId: (state, action) => {
            state.newMessageId = action.payload;
        },
        updateReaction: (state, action) => {
            const updated = action.payload;
            state.message = state.message.map((msg) =>
                msg._id === updated._id ? updated : msg
            );
        },
    },
});

export const { addAllMessages, addNewMessage, addNewMessageId, updateReaction } =
    messageSlice.actions;
export default messageSlice.reducer;
