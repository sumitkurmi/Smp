import { createSlice } from "@reduxjs/toolkit";

const onlineSlice = createSlice({
  name: "online",
  initialState: {
    onlineUserIds: [],
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUserIds = action.payload || [];
    },
    addOnlineUser: (state, action) => {
      const id = action.payload;
      if (id && !state.onlineUserIds.includes(id)) {
        state.onlineUserIds = [...state.onlineUserIds, id];
      }
    },
    removeOnlineUser: (state, action) => {
      const id = action.payload;
      state.onlineUserIds = state.onlineUserIds.filter((uid) => uid !== id);
    },
  },
});

export const { setOnlineUsers, addOnlineUser, removeOnlineUser } =
  onlineSlice.actions;
export default onlineSlice.reducer;

