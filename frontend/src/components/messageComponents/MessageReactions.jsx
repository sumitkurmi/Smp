import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { updateReaction } from "../../redux/slices/messageSlice";
import socket from "../../socket/socket";

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const MessageReactions = ({ message }) => {
	const dispatch = useDispatch();
	const authUserId = useSelector((state) => state?.auth?._id);
	const [sending, setSending] = useState(false);

	// reactions is a Map-like object: { "👍": [userId1, ...], ... }
	const reactions = message?.reactions || {};
	const entries = Object.entries(reactions);

	const handleReact = async (emoji) => {
		if (sending) return;
		setSending(true);
		const token = localStorage.getItem("token");
		try {
			const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message/react`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ messageId: message._id, emoji }),
			});
			const json = await res.json();
			if (res.ok && json?.data) {
				// Update local state + broadcast to chat
				dispatch(updateReaction(json.data));
				socket.emit("react message", json.data);
			} else {
				toast.error(json?.message || "Failed to react");
			}
		} catch (err) {
			console.error(err);
			toast.error("Failed to react");
		} finally {
			setSending(false);
		}
	};

	const userHasReacted = (users) =>
		Array.isArray(users) && users.some((id) => id.toString() === authUserId?.toString());

	return (
		<div className="flex items-center gap-1 flex-wrap mt-1">
			{entries.map(([emoji, users]) => (
				<button
					key={emoji}
					onClick={() => handleReact(emoji)}
					disabled={sending}
					title={`${emoji} ${Array.isArray(users) ? users.length : 0} reaction(s)`}
					className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition
						${
							userHasReacted(users)
								? "bg-yellow-400/20 border-yellow-400/50 text-yellow-100"
								: "bg-white/5 border-white/10 text-richblack-200 hover:bg-white/10"
						}`}
				>
					<span>{emoji}</span>
					<span className="text-[10px] font-semibold">{Array.isArray(users) ? users.length : 0}</span>
				</button>
			))}

			{/* Quick picker */}
			<div className="flex items-center gap-0.5 ml-1">
				{EMOJI_OPTIONS.map((emoji) => (
					<button
						key={emoji}
						onClick={() => handleReact(emoji)}
						disabled={sending}
						title={`React ${emoji}`}
						className="text-sm hover:scale-125 transition-transform opacity-70 hover:opacity-100"
					>
						{emoji}
					</button>
				))}
			</div>
		</div>
	);
};

export default MessageReactions;

