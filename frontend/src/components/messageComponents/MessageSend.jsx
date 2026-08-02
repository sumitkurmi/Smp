import Picker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { FaFolderOpen, FaPaperPlane, FaSmile } from "react-icons/fa";
import { LuLoader } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { setSendLoading, setTyping } from "../../redux/slices/conditionSlice";
import { addNewMessage, addNewMessageId } from "../../redux/slices/messageSlice";
import socket from "../../socket/socket";

let lastTypingTime;

const MessageSend = ({ chatId }) => {
	const mediaFile = useRef();
	const [newMessage, setMessage] = useState("");
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);

	const dispatch = useDispatch();
	const isSendLoading = useSelector((state) => state?.condition?.isSendLoading);
	const isSocketConnected = useSelector((state) => state?.condition?.isSocketConnected);
	const isTyping = useSelector((state) => state?.condition?.isTyping);
	const selectedChat = useSelector((state) => state?.myChat?.selectedChat);

	useEffect(() => {
		socket.on("typing", () => dispatch(setTyping(true)));
		socket.on("stop typing", () => dispatch(setTyping(false)));
		return () => {
			socket.off("typing");
			socket.off("stop typing");
		};
	}, [dispatch]);

	// Upload any file type
	const handleMediaUpload = async () => {
		const files = mediaFile.current?.files;
		if (!files || files.length === 0) return;

		const formData = new FormData();
		for (let i = 0; i < files.length; i++) {
			formData.append("file", files[i]);
		}

		const token = localStorage.getItem("token");

		dispatch(setSendLoading(true));
		try {
			const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message/upload`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			const data = await res.json();

			if (data.files && Array.isArray(data.files)) {
				for (const file of data.files) {
					let mediaType = "file";
					if (file.type === "image") mediaType = "image";
					else if (file.type === "video") mediaType = "video";
					await sendMediaMessage(file.url, mediaType, file.name);
				}
			} else {
				toast.error("Upload failed");
			}
			mediaFile.current.value = null;
		} catch (err) {
			console.error("Upload error:", err);
			toast.error("Media upload error");
		} finally {
			dispatch(setSendLoading(false));
		}
	};

	const sendMediaMessage = async (mediaUrl, mediaType, fileName = "") => {
		const token = localStorage.getItem("token");
		const payload = {
			message:
				mediaType === "video"
					? "videofiles"
					: mediaType === "image"
					? "imagefiles"
					: fileName || "file",
			chatId,
			image_urls: mediaType === "image" ? [mediaUrl] : [],
			video_urls: mediaType === "video" ? [mediaUrl] : [],
			files:
				mediaType === "file"
					? [{ url: mediaUrl, name: fileName }]
					: [],
		};

		dispatch(setSendLoading(true));
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});
			const result = await response.json();
			dispatch(addNewMessageId(result?.data?._id));
			dispatch(addNewMessage(result?.data));
			socket.emit("new message", result?.data);
		} catch (err) {
			console.error("Failed to send media message:", err);
			toast.error("Failed to send media message");
		} finally {
			dispatch(setSendLoading(false));
		}
	};

	const handleSendMessage = async () => {
		const message = newMessage.trim();
		if (!message) return;

		setMessage("");
		socket.emit("stop typing", selectedChat._id);
		dispatch(setSendLoading(true));

		const token = localStorage.getItem("token");

		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ message, chatId }),
			});
			const result = await response.json();

			dispatch(addNewMessageId(result?.data?._id));
			dispatch(addNewMessage(result?.data));
			socket.emit("new message", result?.data);
		} catch (err) {
			console.error("Text message error:", err);
			toast.error("Message sending failed");
		} finally {
			dispatch(setSendLoading(false));
		}
	};

	const handleTyping = (e) => {
		const value = e.target.value;
		setMessage(value);

		if (!isSocketConnected) return;

		if (!isTyping) {
			socket.emit("typing", selectedChat._id);
		}

		lastTypingTime = new Date().getTime();
		const timerLength = 3000;

		setTimeout(() => {
			const timeNow = new Date().getTime();
			const timeDiff = timeNow - lastTypingTime;
			if (timeDiff > timerLength) {
				socket.emit("stop typing", selectedChat._id);
			}
		}, timerLength);
	};

	return (
		<form
			className="relative w-full flex items-center gap-4 h-[7vh] px-4 bg-richblack-900 border-t border-richblack-700 text-white mt-6 shadow-inner"
			onSubmit={(e) => {
				e.preventDefault();
				if (newMessage.trim()) handleSendMessage();
			}}
		>
			{/* File Upload */}
			<input
				type="file"
				ref={mediaFile}
				multiple
				style={{ display: "none" }}
				onChange={handleMediaUpload}
			/>

			<button
				type="button"
				onClick={() => mediaFile.current.click()}
				className="p-2 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
				title="Upload File"
				disabled={isSendLoading}
			>
				<FaFolderOpen size={20} />
			</button>

			<button
				type="button"
				onClick={() => setShowEmojiPicker((v) => !v)}
				className="p-2 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
				title="Emoji"
				disabled={isSendLoading}
			>
				<FaSmile size={20} />
			</button>

			{showEmojiPicker && (
				<div className="absolute bottom-full mb-2 left-0 z-50">
					<Picker
						onEmojiClick={(emojiData) => {
							setMessage((m) => m + emojiData.emoji);
							setShowEmojiPicker(false);
						}}
					/>
				</div>
			)}

			{/* Message Input */}
			<input
				type="text"
				className="flex-1 bg-richblack-800 px-4 py-2 rounded-full placeholder:text-richblack-400 text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-richblack-700"
				placeholder="Type a message..."
				value={newMessage}
				onChange={handleTyping}
				disabled={isSendLoading}
			/>

			{/* Send Button or Loader */}
			{!isSendLoading && newMessage.trim() && (
				<button
					type="button"
					onClick={handleSendMessage}
					className="p-2 rounded-full bg-yellow-400 text-black hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
					title="Send Message"
				>
					<FaPaperPlane size={18} />
				</button>
			)}
			{isSendLoading && (
				<div className="p-2">
					<LuLoader className="animate-spin text-yellow-400" size={18} />
				</div>
			)}
		</form>
	);
};

export default MessageSend;
