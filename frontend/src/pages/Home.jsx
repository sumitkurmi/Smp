import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ChatNotSelected from "../components/chatComponents/ChatNotSelected";
import MyChat from "../components/chatComponents/MyChat";
import UserSearch from "../components/chatComponents/UserSearch";
import MessageBox from "../components/messageComponents/MessageBox";
import {
  setChatDetailsBox,
  setSocketConnected
} from "../redux/slices/conditionSlice";
import { addAllMessages, addNewMessage } from "../redux/slices/messageSlice";
import {
  addMeetingNotification,
  addMyChat,
  addNewChat,
  addNewMessageRecieved,
  deleteSelectedChat,
  incrementUnread
} from "../redux/slices/myChatSlice";
import {
  addOnlineUser,
  removeOnlineUser,
  setOnlineUsers,
} from "../redux/slices/onlineSlice";
import socket from "../socket/socket";
import { receivedSound } from "../utils/notificationSound";

let selectedChatCompare;

const Home = () => {
  const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
  const dispatch = useDispatch();
  const isUserSearchBox = useSelector(
    (store) => store?.condition?.isUserSearchBox
  );
  const authUserId = useSelector((store) => store?.auth?._id);

  // SOCKET CONNECTION
  useEffect(() => {
    if (!authUserId) return;
    socket.emit("setup", authUserId);
    socket.on("connected", () => dispatch(setSocketConnected(true)));

    // Presence: initial list + live updates
    const onlineHandler = (userId) => dispatch(addOnlineUser(userId));
    const offlineHandler = (userId) => dispatch(removeOnlineUser(userId));
    const onlineListHandler = (userIds) => dispatch(setOnlineUsers(userIds));

    socket.on("user online", onlineHandler);
    socket.on("user offline", offlineHandler);
    socket.on("online users", onlineListHandler);

    return () => {
      socket.off("user online", onlineHandler);
      socket.off("user offline", offlineHandler);
      socket.off("online users", onlineListHandler);
    };
  }, [authUserId, dispatch]);

  // SOCKET MESSAGE RECEIVED
  useEffect(() => {
    selectedChatCompare = selectedChat;
    const messageHandler = async (newMessageReceived) => {
      const token = localStorage.getItem("token");
      if (
        selectedChatCompare &&
        selectedChatCompare._id === newMessageReceived.chat._id
      ) {
        dispatch(addNewMessage(newMessageReceived));
      } else {
        receivedSound();
        dispatch(addNewMessageRecieved(newMessageReceived));
        dispatch(incrementUnread(newMessageReceived.chat._id));
      }

      if (token) {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json?.data) dispatch(addMyChat(json.data));
      }
    };
    socket.on("message received", messageHandler);
    return () => socket.off("message received", messageHandler);
  }, [selectedChat, dispatch]);

  // SOCKET CLEAR CHAT
  useEffect(() => {
    const clearChatHandler = (chatId) => {
      if (chatId === selectedChat?._id) {
        dispatch(addAllMessages([]));
        toast.success("Cleared all messages");
      }
    };
    socket.on("clear chat", clearChatHandler);
    return () => socket.off("clear chat", clearChatHandler);
  });

  // SOCKET DELETE CHAT
  useEffect(() => {
    const deleteChatHandler = (chatId) => {
      dispatch(setChatDetailsBox(false));
      if (selectedChat && chatId === selectedChat._id) {
        dispatch(addAllMessages([]));
      }
      dispatch(deleteSelectedChat(chatId));
      toast.success("Chat deleted successfully");
    };
    socket.on("delete chat", deleteChatHandler);
    return () => socket.off("delete chat", deleteChatHandler);
  });

  // SOCKET CHAT CREATED
  useEffect(() => {
    const chatCreatedHandler = (chat) => {
      dispatch(addNewChat(chat));
      toast.success("Created & Selected chat");
    };
    socket.on("chat created", chatCreatedHandler);
    return () => socket.off("chat created", chatCreatedHandler);
  });

  // SOCKET ATTENDANCE UPDATE
  useEffect(() => {
    const attendanceUpdatedHandler = (notification) => {
      const { chatId, meetingTitle, studentName, status, updatedBy } = notification;
      const statusText = status === "present" ? "present" : "absent";
      toast.info(
        `${studentName} was marked ${statusText} for ${meetingTitle} by ${updatedBy}`
      );

      const token = localStorage.getItem("token");
      if (token) {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((json) => {
            if (json?.data) dispatch(addMyChat(json.data));
          })
          .catch(() => {});
      }
    };

    socket.on("attendance updated", attendanceUpdatedHandler);
    return () => socket.off("attendance updated", attendanceUpdatedHandler);
  }, [dispatch]);

  // SOCKET MEETING SCHEDULED
  useEffect(() => {
    const meetingScheduledHandler = (notification) => {
      // Add to notification box
      dispatch(addMeetingNotification(notification));

      // Show toast reminder
      const formattedTime = notification.scheduledAt
        ? new Date(notification.scheduledAt).toLocaleString()
        : "";
      toast.info(
        `📅 New meeting scheduled${
          notification.chatName ? ` in ${notification.chatName}` : ""
        }: ${notification.meetingTitle}${formattedTime ? ` at ${formattedTime}` : ""}`
      );

      // Refresh chat list to get the meeting icon + meetings data
      const token = localStorage.getItem("token");
      if (token) {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((json) => {
            if (json?.data) dispatch(addMyChat(json.data));
          })
          .catch(() => {});
      }
    };

    socket.on("meeting scheduled", meetingScheduledHandler);
    return () => socket.off("meeting scheduled", meetingScheduledHandler);
  }, [dispatch]);

  return (
    <div className="w-full h-[calc(100vh-4rem)] px-2 md:px-6 py-4">
      <div className="flex w-full h-full border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm glass">
        {/* Sidebar - Chat list or User search */}
        <div
          className={`${
            selectedChat ? "hidden" : "block"
          } sm:block sm:w-[35%] w-full h-full bg-richblack-800/60 relative border-r border-white/10`}
        >
          {/* Content */}
          <div className="h-full flex flex-col min-h-0 overflow-hidden">
            {isUserSearchBox ? <UserSearch /> : <MyChat />}
          </div>
        </div>

        {/* Main Chat Area */}
        <div
          className={`${
            !selectedChat ? "hidden" : "block"
          } sm:block sm:w-[65%] w-full h-full relative flex flex-col min-h-0`}
        >
          {selectedChat ? (
            <MessageBox chatId={selectedChat._id} />
          ) : (
            <ChatNotSelected />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

