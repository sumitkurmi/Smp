import { useEffect, useRef, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { FaArrowLeft, FaCalendarCheck } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
	setChatDetailsBox,
	setMessageLoading,
} from "../../redux/slices/conditionSlice";
import { addAllMessages } from "../../redux/slices/messageSlice";
import { addSelectedChat } from "../../redux/slices/myChatSlice";

import ChatDetailsBox from "../chatDetails/ChatDetailsBox";
import MessageLoading from "../loading/MessageLoading";
import AllMessages from "./AllMessages";
import MessageSend from "./MessageSend";

import socket from "../../socket/socket";
import getChatName, { getChatImage } from "../../utils/getChatName";
import { canSeePresence, getOtherUser, isUserOnline } from "../../utils/presence";

const MessageBox = ({ chatId }) => {
	const dispatch = useDispatch();
	const chatDetailsBox = useRef(null);
	const [isExiting, setIsExiting] = useState(false);
	const [replyTo, setReplyTo] = useState(null);

	const isChatDetailsBox = useSelector((state) => state?.condition?.isChatDetailsBox);
	const isMessageLoading = useSelector((state) => state?.condition?.isMessageLoading);
	const allMessage = useSelector((state) => state?.message?.message);
	const selectedChat = useSelector((state) => state?.myChat?.selectedChat);
	const authUserId = useSelector((state) => state?.auth?._id);
	const accountType = useSelector((state) => state?.auth?.accountType);
	const onlineUserIds = useSelector((state) => state?.online?.onlineUserIds || []);

	// Fetch messages on chat change
	useEffect(() => {
		const fetchMessages = async () => {
			dispatch(setMessageLoading(true));
			const token = localStorage.getItem("token");

			try {
				const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message/${chatId}`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});
				const result = await response.json();
				dispatch(addAllMessages(result?.data || []));
				socket.emit("join chat", selectedChat._id);
			} catch (error) {
				console.error("Message fetch failed:", error);
				toast.error("Message loading failed.");
			} finally {
				dispatch(setMessageLoading(false));
			}
		};

		if (chatId) fetchMessages();
	}, [chatId, dispatch, selectedChat?._id]);

	// Outside click handler for chatDetailsBox
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				chatDetailsBox.current &&
				!chatDetailsBox.current.contains(event.target)
			) {
				setIsExiting(true);
				setTimeout(() => {
					dispatch(setChatDetailsBox(false));
					setIsExiting(false);
				}, 500);
			}
		};

		if (isChatDetailsBox) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isChatDetailsBox, dispatch]);

	const showPresence = canSeePresence(accountType);
	const otherUser = getOtherUser(selectedChat, authUserId);
	const isOnline = showPresence && otherUser && isUserOnline(otherUser._id, onlineUserIds);

return (
		<div className="w-full h-full flex flex-col min-h-0">
			{/* Header */}
			<div
				className="shrink-0 py-6 sm:px-6 px-3 w-full h-[7vh] font-semibold flex justify-between items-center bg-richblack-900/80 backdrop-blur-sm text-richblack-5 border-b border-white/10 cursor-pointer"
				onClick={() => dispatch(setChatDetailsBox(true))}
			>
				<div className="flex items-center gap-2">
					{/* Back Button (only on small screens) */}
					<div
						onClick={(e) => {
							e.stopPropagation();
							dispatch(addSelectedChat(null));
						}}
						className="sm:hidden bg-richblack-800 hover:bg-richblack-700 h-8 w-8 rounded-md flex items-center justify-center"
					>
						<FaArrowLeft title="Back" fontSize={14} />
					</div>

					{/* Chat Avatar & Name */}
					<div className="relative">
						<img
							src={getChatImage(selectedChat, authUserId)}
							alt="Chat Avatar"
							className="h-9 w-9 rounded-full object-cover"
						/>
						{isOnline && <span className="presence-dot" />}
					</div>
					<div className="flex flex-col">
						<h1 className="line-clamp-1 leading-tight">{getChatName(selectedChat, authUserId)}</h1>
						{showPresence && otherUser && (
							<span className={`text-[10px] font-light ${isOnline ? "text-green-400" : "text-richblack-400"}`}>
								{isOnline ? "Online" : "Offline"}
							</span>
						)}
					</div>
				</div>

				<CiMenuKebab fontSize={18} title="Menu" className="cursor-pointer" />
			</div>

			{/* Chat Details Box */}
			{isChatDetailsBox && (
				<div
					className={`fixed inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 ${
						isExiting ? "box-exit" : "box-enter"
					}`}
				>
					<div
						ref={chatDetailsBox}
						className="w-full max-w-4xl max-h-[90vh] bg-richblack-800 rounded-2xl shadow-2xl overflow-hidden flex"
					>
						<ChatDetailsBox />
					</div>
				</div>
			)}

			{/* Meeting Reminder Banner */}
			{selectedChat?.isGroupChat && selectedChat?.meetings?.length > 0 && (
				<div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/10 via-richblack-800/80 to-transparent border-b border-yellow-400/20 text-yellow-200 text-xs font-medium">
					<FaCalendarCheck className="text-yellow-400 shrink-0" size={14} />
					<span className="truncate">
						{selectedChat.meetings.length} meeting
						{selectedChat.meetings.length > 1 ? "s" : ""} scheduled — tap the menu for details
					</span>
				</div>
			)}

			{/* Messages */}
			{isMessageLoading ? (
				<MessageLoading />
			) : (
				<AllMessages
					allMessage={allMessage}
					authUserId={authUserId}
					onReply={(msg) => {
						setReplyTo(msg);
					}}
				/>
			)}

			{/* Message Input */}
<MessageSend
				chatId={chatId}
				replyTo={replyTo}
				setReplyTo={setReplyTo}
			/>
		</div>
	);
};

export default MessageBox;

