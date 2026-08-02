import { useEffect } from "react";
import { FaSearch } from "react-icons/fa";
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
import ChatShimmer from "../loading/ChatShimmer";

const MyChat = () => {
	const dispatch = useDispatch();
	const isUserSearchBox = useSelector((state) => state.condition.isUserSearchBox);
	const myChat = useSelector((store) => store.myChat.chat);
	const authUserId = useSelector((store) => store?.auth?._id);
	const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
	const isChatLoading = useSelector((store) => store?.condition?.isChatLoading);
	const newMessageId = useSelector((store) => store?.message?.newMessageId);
	const isGroupChatId = useSelector((store) => store.condition.isGroupChatId);
	const accountType = useSelector((store) => store?.auth?.accountType);

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

	return (
		<>
			{/* Header */}
			{!isUserSearchBox && (
				<div className="p-4 w-full h-[7vh] flex justify-between items-center bg-richblack-900 text-yellow-400 font-semibold border-b border-richblack-600 shadow-sm">
					<h1 className="text-lg whitespace-nowrap">My Chat</h1>
					<div className="flex items-center gap-2">
						<button
							onClick={() => dispatch(setUserSearchBox())}
							className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-full shadow hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
							title="New Chat"
						>
							<FaSearch size={18} />
							<span className="whitespace-nowrap">New Chat</span>
						</button>
						{accountType === "mentor" && (
							<button
								onClick={() => dispatch(setGroupChatBox())}
								className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-full shadow hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
								title="Create New Group"
							>
								<MdGroupAdd size={18} />
								<span className="whitespace-nowrap">New Group</span>
							</button>
						)}
					</div>
				</div>
			)}

			{/* Chat List */}
			<div className="flex flex-col w-full px-4 py-3 space-y-3 overflow-y-auto scroll-style h-[73vh]">
				{isChatLoading ? (
					<ChatShimmer />
				) : myChat.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-richblack-300 space-y-2">
						<h1 className="text-base font-semibold">No conversations yet</h1>
						<p className="text-sm">Start a new chat or create a group</p>
					</div>
				) : (
					myChat.map((chat) => (
						<button
							key={chat._id}
							onClick={() => dispatch(addSelectedChat(chat))}
							className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all border
								${
									selectedChat?._id === chat?._id
										? "border-yellow-400 bg-richblack-900 text-white shadow-inner"
										: "border-richblack-600 bg-richblack-700 text-white hover:bg-richblack-600 shadow hover:shadow-lg"
								}
							`}
						>
							<img
								src={getChatImage(chat, authUserId)}
								alt="user"
								className="h-12 w-12 rounded-full object-cover border-2 border-transparent"
							/>
							<div className="flex-1">
								<div className="flex justify-between items-center">
									<span className="font-semibold capitalize truncate text-lg">
										{getChatName(chat, authUserId)}
									</span>
									<span className="text-xs font-light text-richblack-300">
										{chat?.latestMessage && SimpleTime(chat.latestMessage.createdAt)}
									</span>
								</div>
								<div className="flex items-center gap-1 text-sm font-light truncate">
									{chat.latestMessage ? (
										<>
											{chat.latestMessage.sender._id === authUserId && (
												<VscCheckAll fontSize={14} />
											)}
											<span className="truncate">
												{chat.latestMessage.message}
											</span>
										</>
									) : (
										<span className="text-richblack-300">{SimpleDateAndTime(chat.createdAt)}</span>
									)}
								</div>
							</div>
						</button>
					))
				)}
			</div>
		</>
	);
};

export default MyChat;
