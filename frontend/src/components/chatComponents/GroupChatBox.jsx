import { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { HiUsers } from "react-icons/hi2";
import { MdOutlineClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
	setChatLoading,
	setGroupChatBox,
	setGroupChatId,
	setLoading,
} from "../../redux/slices/conditionSlice";
import { addSelectedChat } from "../../redux/slices/myChatSlice";
import socket from "../../socket/socket";
import { SimpleDateAndTime } from "../../utils/formateDateTime";
import { handleScrollEnd } from "../../utils/handleScrollTop";
import { canSeePresence, isUserOnline } from "../../utils/presence";
import ChatShimmer from "../loading/ChatShimmer";

const GroupChatBox = () => {
	const groupUser = useRef("");
	const dispatch = useDispatch();
	const isChatLoading = useSelector((store) => store?.condition?.isChatLoading);
	const authUserId = useSelector((store) => store?.auth?._id);
	const accountType = useSelector((store) => store?.auth?.accountType);
	const onlineUserIds = useSelector((store) => store?.online?.onlineUserIds || []);

	const [isGroupName, setGroupName] = useState("");
	const [users, setUsers] = useState([]);
	const [inputUserName, setInputUserName] = useState("");
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [isGroupUsers, setGroupUsers] = useState([]);

	useEffect(() => {
		const getAllUsers = () => {
			dispatch(setChatLoading(true));
			const token = localStorage.getItem("token");

			fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/users`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			})
				.then((res) => res.json())
				.then((json) => {
					const studentUsers = (json.data || []).filter(u => u.accountType === 'student');
					setUsers(studentUsers);
					setSelectedUsers(studentUsers);
					dispatch(setChatLoading(false));
				})
				.catch((err) => {
					console.log(err);
					dispatch(setChatLoading(false));
				});
		};
		getAllUsers();
	}, []);

	useEffect(() => {
		setSelectedUsers(
			users.filter((user) =>
				`${user.firstName} ${user.lastName} ${user.email}`
					.toLowerCase()
					.includes(inputUserName.toLowerCase())
			)
		);
	}, [inputUserName]);

	useEffect(() => {
		handleScrollEnd(groupUser.current);
	}, [isGroupUsers]);

	const addGroupUser = (user) => {
		const exists = isGroupUsers.some((u) => u._id === user._id);
		if (!exists) {
			setGroupUsers([...isGroupUsers, user]);
		} else {
			toast.warn(`"${user.firstName}" already added`);
		}
	};

	const handleRemoveGroupUser = (removeUserId) => {
		setGroupUsers(isGroupUsers.filter((user) => user._id !== removeUserId));
	};

	const handleCreateGroupChat = () => {
		if (isGroupUsers.length < 2) {
			toast.warn("Select at least 2 users");
			return;
		}
		if (!isGroupName.trim()) {
			toast.warn("Enter a group name");
			return;
		}

		dispatch(setGroupChatBox());
		dispatch(setLoading(true));

		const token = localStorage.getItem("token");

		fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/group`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				name: isGroupName.trim(),
				users: isGroupUsers,
			}),
		})
			.then((res) => res.json())
			.then((json) => {
				dispatch(addSelectedChat(json.data));
				dispatch(setGroupChatId(json.data._id));
				dispatch(setLoading(false));
				socket.emit("chat created", json.data, authUserId);
				toast.success("Group created and selected!");
			})
			.catch((err) => {
				console.log(err);
				toast.error(err.message);
				dispatch(setLoading(false));
			});
	};

	const showPresence = canSeePresence(accountType);

	return (
		<div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
			<div className="w-full max-w-2xl rounded-2xl bg-gradient-to-br from-richblack-800 to-richblack-900 border border-white/10 p-6 shadow-2xl relative modal-enter">
				<h2 className="text-2xl font-bold text-gradient-gold text-center mb-6 flex items-center justify-center gap-2">
					<HiUsers size={24} /> Create a Group
				</h2>

				{/* Search and selected users */}
				<div className="space-y-4">
					{/* Search input */}
					<div className="relative">
						<FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
						<input
							value={inputUserName}
							onChange={(e) => setInputUserName(e.target.value)}
							type="text"
							placeholder="Search students..."
							className="w-full bg-richblack-700/70 border border-white/10 text-white pl-10 pr-4 py-2.5 rounded-full placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition"
						/>
					</div>

					{/* Selected users */}
					<div
						ref={groupUser}
						className="flex gap-2 flex-wrap max-h-24 overflow-y-auto py-2"
					>
						{isGroupUsers.map((user) => (
							<div
								key={user._id}
								className="flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-400/40 text-yellow-100 bg-richblack-700/70"
							>
								<span>{user.firstName}</span>
								<button
									onClick={() => handleRemoveGroupUser(user._id)}
									className="text-sm hover:text-pink-300"
								>
									<MdOutlineClose size={16} />
								</button>
							</div>
						))}
					</div>

					{/* User list */}
					<div className="max-h-64 overflow-y-auto scroll-style space-y-2">
						{isChatLoading ? (
							<ChatShimmer />
						) : selectedUsers.length === 0 ? (
							<div className="text-center text-richblack-300">
								No students found.
							</div>
						) : (
							selectedUsers.map((user) => {
								const online = showPresence && isUserOnline(user._id, onlineUserIds);
								return (
									<button
										key={user._id}
										onClick={() => {
											addGroupUser(user);
											setInputUserName("");
										}}
										className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:bg-richblack-700/70 hover:border-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition"
									>
										<div className="relative shrink-0">
											<img
												src={user.image}
												alt="user"
												className="h-10 w-10 rounded-full object-cover"
											/>
											{online && <span className="presence-dot" />}
										</div>
										<div className="flex flex-col text-white text-left">
											<span className="capitalize">
												{user.firstName} {user.lastName}
											</span>
											<span className="text-xs text-richblack-300">
												{SimpleDateAndTime(user.createdAt)}
											</span>
										</div>
									</button>
								);
							})
						)}
					</div>

					{/* Group Name + Button */}
					<div className="flex gap-3 items-center mt-4">
						<input
							type="text"
							placeholder="Group Name"
							onChange={(e) => setGroupName(e.target.value)}
							className="flex-1 bg-richblack-700/70 border border-white/10 text-white px-4 py-2.5 rounded-full placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition"
						/>
						<button
							onClick={handleCreateGroupChat}
							className="bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-300 hover:to-yellow-200 text-black font-semibold px-6 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 transition shadow-lg shadow-yellow-500/20"
						>
							Create
						</button>
					</div>
				</div>

				{/* Close Button */}
				<button
					onClick={() => dispatch(setGroupChatBox())}
					className="absolute top-3 right-3 p-2 text-richblack-300 hover:text-yellow-400 transition"
				>
					<MdOutlineClose size={24} />
				</button>
			</div>
		</div>
	);
};

export default GroupChatBox;

