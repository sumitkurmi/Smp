import { useEffect, useState } from "react";
import { FaCalendarCheck, FaSearch } from "react-icons/fa";
import { MdGroupAdd } from "react-icons/md";
import { VscCheckAll } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import {
	setChatLoading,
	setGroupChatBox,
	setUserSearchBox,
} from "../../redux/slices/conditionSlice";
import {
	addMyChat,
	addSelectedChat,
} from "../../redux/slices/myChatSlice";
import {
	SimpleDateAndTime,
	SimpleTime,
} from "../../utils/formateDateTime";
import getChatName, { getChatImage } from "../../utils/getChatName";
import { canSeePresence, getOtherUser, isUserOnline } from "../../utils/presence";
import ChatShimmer from "../loading/ChatShimmer";

const MyChat = () => {
	const dispatch = useDispatch();
	const isUserSearchBox = useSelector((state) => state.condition.isUserSearchBox);
	const myChat = useSelector((store) => store.myChat.chat);
	const authUserId = useSelector((store) => store?.auth?._id);
	const accountType = useSelector((store) => store?.auth?.accountType);
	const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
	const isChatLoading = useSelector((store) => store?.condition?.isChatLoading);
	const newMessageId = useSelector((store) => store?.message?.newMessageId);
	const isGroupChatId = useSelector((store) => store.condition.isGroupChatId);
	const unreadCounts = useSelector((store) => store?.myChat?.unreadCounts || {});
	const onlineUserIds = useSelector((store) => store?.online?.onlineUserIds || []);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		const getMyChat = () => {
			dispatch(setChatLoading(true));
			const token = localStorage.getItem("token");
			fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			})
				.then((res) => res.json())
				.then((json) => {
					dispatch(addMyChat(json?.data || []));
					dispatch(setChatLoading(false));
				})
				.catch((err) => {
					console.log(err);
					dispatch(setChatLoading(false));
				});
		};
		getMyChat();
	}, [newMessageId, isGroupChatId]);

	const showPresence = canSeePresence(accountType);

	// Filter chats by search term
	const filteredChats = myChat.filter((chat) => {
		if (!searchTerm.trim()) return true;
		const name = getChatName(chat, authUserId).toLowerCase();
		const latest = (chat?.latestMessage?.message || "").toLowerCase();
		return name.includes(searchTerm.toLowerCase()) || latest.includes(searchTerm.toLowerCase());
	});

return (
		<div className="w-full h-full flex flex-col min-h-0">
			{/* Header */}
			{!isUserSearchBox && (
				<div className="shrink-0 p-4 w-full h-[7vh] flex justify-between items-center bg-richblack-900/80 backdrop-blur-sm text-yellow-400 font-semibold border-b border-white/10 shadow-sm">
					<h1 className="text-lg whitespace-nowrap font-bold tracking-wide">My Chat</h1>
					<div className="flex items-center gap-2">
						<button
							onClick={() => dispatch(setUserSearchBox())}
							className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-300 text-black font-semibold rounded-full shadow-lg shadow-yellow-500/20 hover:from-yellow-300 hover:to-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
							title="New Chat"
						>
							<FaSearch size={16} />
							<span className="whitespace-nowrap hidden sm:inline">New Chat</span>
						</button>
						{accountType === "mentor" && (
							<button
								onClick={() => dispatch(setGroupChatBox())}
								className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-300 text-black font-semibold rounded-full shadow-lg shadow-yellow-500/20 hover:from-yellow-300 hover:to-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
								title="Create New Group"
							>
								<MdGroupAdd size={16} />
								<span className="whitespace-nowrap hidden sm:inline">New Group</span>
							</button>
						)}
					</div>
				</div>
			)}

			{/* Search / Filter */}
			{!isUserSearchBox && (
				<div className="px-4 py-2 bg-richblack-900/60 border-b border-white/5">
					<div className="relative">
						<FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400 text-sm" />
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search chats..."
							className="w-full bg-richblack-800/80 text-white placeholder:text-richblack-400 pl-9 pr-4 py-2 rounded-full border border-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition text-sm"
						/>
					</div>
				</div>
			)}

			{/* Chat List */}
			<div className="flex-1 flex flex-col w-full px-4 py-3 space-y-3 overflow-y-auto scroll-style min-h-0">
				{isChatLoading ? (
					<ChatShimmer />
				) : filteredChats.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-richblack-300 space-y-2">
						<h1 className="text-base font-semibold">
							{searchTerm ? "No chats match your search" : "No conversations yet"}
						</h1>
						<p className="text-sm">{searchTerm ? "Try a different keyword" : "Start a new chat or create a group"}</p>
					</div>
				) : (
					filteredChats.map((chat) => {
						const isSelected = selectedChat?._id === chat?._id;
						const unread = unreadCounts[chat._id] || 0;
						const otherUser = getOtherUser(chat, authUserId);
						const showDot = showPresence && !chat.isGroupChat && otherUser && isUserOnline(otherUser._id, onlineUserIds);

						return (
							<button
								key={chat._id}
								onClick={() => dispatch(addSelectedChat(chat))}
								className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border
									${
										isSelected
											? "border-yellow-400/70 bg-gradient-to-r from-richblack-800 to-richblack-700 text-white shadow-lg shadow-yellow-500/10"
											: "border-white/5 bg-richblack-800/60 text-white hover:bg-richblack-700/80 hover:border-white/10 shadow hover:shadow-lg"
									}
								`}
							>
								<div className="relative shrink-0">
									<img
										src={getChatImage(chat, authUserId)}
										alt="user"
										className="h-12 w-12 rounded-full object-cover border-2 border-transparent"
									/>
									{showDot && <span className="presence-dot" />}
								</div>
<div className="flex-1 min-w-0">
									<div className="flex justify-between items-center gap-2">
										<div className="flex items-center gap-1.5 min-w-0">
											<span className="font-semibold capitalize truncate text-base">
												{getChatName(chat, authUserId)}
											</span>
											{chat?.isGroupChat && chat?.meetings?.length > 0 && (
												<span
													className="shrink-0 text-yellow-400"
													title={`${chat.meetings.length} meeting(s) scheduled`}
												>
													<FaCalendarCheck size={14} />
												</span>
											)}
										</div>
										<span className="text-xs font-light text-richblack-300 shrink-0">
											{chat?.latestMessage && SimpleTime(chat.latestMessage.createdAt)}
										</span>
									</div>
									<div className="flex items-center justify-between gap-2 mt-0.5">
										<div className="flex items-center gap-1 text-sm font-light truncate text-richblack-300">
											{chat.latestMessage ? (
												<>
													{chat.latestMessage.sender._id === authUserId && (
														<VscCheckAll fontSize={14} className="text-yellow-400" />
													)}
													<span className="truncate">
														{chat.latestMessage.message}
													</span>
												</>
											) : (
												<span className="text-richblack-400">{SimpleDateAndTime(chat.createdAt)}</span>
											)}
										</div>
										{unread > 0 && (
											<span className="shrink-0 min-w-[22px] h-[22px] px-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-black text-xs font-bold flex items-center justify-center shadow-lg badge-pop">
												{unread > 99 ? "99+" : unread}
											</span>
										)}
									</div>
								</div>
							</button>
						);
					})
)}
			</div>
		</div>
	);
};

export default MyChat;

