import { useState } from "react";
import { CiCircleInfo } from "react-icons/ci";
import { HiOutlineUsers } from 'react-icons/hi2';
import { MdMessage } from 'react-icons/md';
import { RxUpdate } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setLoading } from "../../redux/slices/conditionSlice";
import { addSelectedChat } from "../../redux/slices/myChatSlice";
import { SimpleDateAndTime } from "../../utils/formateDateTime";
import getChatName, { getChatImage } from "../../utils/getChatName";

const Overview = () => {
	const dispatch = useDispatch();
	const authUserId = useSelector((store) => store?.auth?._id);
	const selectedChat = useSelector((store) => store?.myChat?.selectedChat);

	const [changeNameBox, setChangeNameBox] = useState(false);
	const [changeName, setChangeName] = useState(selectedChat?.chatName);

	const handleShowNameChange = () => {
		if (authUserId === selectedChat?.groupAdmin?._id) {
			setChangeNameBox(!changeNameBox);
			setChangeName(selectedChat?.chatName);
		} else {
			toast.warn("You're not admin");
		}
	};

	const handleChangeName = () => {
		setChangeNameBox(false);
		if (selectedChat?.chatName === changeName.trim()) {
			toast.warn("Name already taken");
			return;
		} else if (!changeName.trim()) {
			toast.warn("Please enter group name");
			return;
		}
		dispatch(setLoading(true));
		const token = localStorage.getItem("token");

		fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/rename`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				name: changeName.trim(),
				chatId: selectedChat?._id,
			}),
		})
			.then((res) => res.json())
			.then((json) => {
				dispatch(addSelectedChat(json?.data));
				dispatch(setLoading(false));
				toast.success("Group name changed");
			})
			.catch((err) => {
				console.log(err);
				toast.error(err.message);
				dispatch(setLoading(false));
			});
	};

	return (
		<div className="text-white px-6 py-6 flex flex-col gap-6 rounded-lg max-h-[60vh] overflow-auto scroll-style">
			{/* Avatar and Title */}
			<div className="flex flex-col items-center justify-center gap-4">
				<div className="relative">
					<div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full" />
					<img
						src={getChatImage(selectedChat, authUserId)}
						alt="chat"
						className="relative h-20 w-20 rounded-full object-cover border-4 border-yellow-400"
					/>
				</div>
				<div className="flex items-center gap-2 text-2xl font-bold text-gradient-gold">
					<span>{getChatName(selectedChat, authUserId)}</span>
					{selectedChat?.isGroupChat && (
						<CiCircleInfo
							fontSize={22}
							title="Change Name"
							onClick={handleShowNameChange}
							className="cursor-pointer text-yellow-400 hover:text-yellow-300 transition"
						/>
					)}
				</div>
			</div>

			{/* Rename Group Section */}
			{changeNameBox && (
				<div className="space-y-3 glass-light rounded-xl p-4 modal-enter">
					<h2 className="text-sm font-medium text-richblack-200">Rename Group Chat:</h2>
					<div className="flex gap-2">
						<input
							type="text"
							placeholder="Enter group name"
							value={changeName}
							onChange={(e) => setChangeName(e.target.value)}
							className="flex-1 px-4 py-2 rounded-full bg-richblack-700/70 border border-yellow-400/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
						/>
						<button
							onClick={handleChangeName}
							title="Change Name"
							className="p-2 rounded-full bg-yellow-400 text-black hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
						>
							<RxUpdate size={20} />
						</button>
					</div>
				</div>
			)}

			{/* Divider */}
			<div className="border-t border-white/10" />

			{/* Chat Meta Info */}
			<div className="space-y-4 text-sm overflow-auto scroll-style">
				<div className="flex items-center gap-2">
					<MdMessage className="text-yellow-400" title="Last Message" />
					<div>
						<h3 className="text-richblack-300">Last Message</h3>
						{selectedChat?.latestMessage ? (
							<p className="text-white/70">{SimpleDateAndTime(selectedChat.latestMessage.updatedAt)}</p>
						) : (
							<p className="text-white/70">No Message yet</p>
						)}
					</div>
				</div>
				{selectedChat?.isGroupChat && (
					<div className="flex items-center gap-2">
						<HiOutlineUsers className="text-blue-400" title="Members" />
						<div>
							<h3 className="text-richblack-300">Members</h3>
							<p className="text-white/70">{selectedChat?.users?.length || 0} members</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Overview;

