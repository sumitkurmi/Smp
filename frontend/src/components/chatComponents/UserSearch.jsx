import { useEffect, useState } from "react";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
	setChatLoading,
	setLoading,
	setUserSearchBox,
} from "../../redux/slices/conditionSlice";
import { addSelectedChat } from "../../redux/slices/myChatSlice";
import socket from "../../socket/socket";
import { canSeePresence, isUserOnline } from "../../utils/presence";
import ChatShimmer from "../loading/ChatShimmer";

const UserSearch = () => {
	const dispatch = useDispatch();
	const isChatLoading = useSelector((store) => store?.condition?.isChatLoading);
	const accountType = useSelector((store) => store?.auth?.accountType);
	const onlineUserIds = useSelector((store) => store?.online?.onlineUserIds || []);
	const [users, setUsers] = useState([]);
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [inputUserName, setInputUserName] = useState("");
	const authUserId = useSelector((store) => store?.auth?._id);

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
					setUsers(json.data || []);
					setSelectedUsers(json.data || []);
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
			users.filter((user) => {
				const searchable = `${user.firstName} ${user.lastName} ${user.email} ${user.regNo}`;
				return searchable
					.toLowerCase()
					.includes(inputUserName.toLowerCase());
			})
		);
	}, [inputUserName]);

	const handleCreateChat = (userId) => {
		dispatch(setLoading(true));
		const token = localStorage.getItem("token");

		fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ userId }),
		})
			.then((res) => res.json())
			.then((json) => {
				dispatch(addSelectedChat(json?.data));
				socket.emit("chat created", json?.data, authUserId);
				dispatch(setLoading(false));
				dispatch(setUserSearchBox());
			})
			.catch((err) => {
				console.error(err);
				toast.error("Failed to create chat.");
				dispatch(setLoading(false));
			});
	};

	const showPresence = canSeePresence(accountType);

	return (
		<>
			{/* Header */}
			<div className="relative p-4 w-full h-[7vh] flex items-center bg-richblack-900/80 backdrop-blur-sm text-yellow-400 font-semibold border-b border-white/10 shadow">
				{/* Back Button */}
				<button
					onClick={() => dispatch(setUserSearchBox())}
					className="p-2 rounded-full hover:bg-richblack-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
					title="Back"
				>
					<FaArrowLeft size={20} className="text-white" />
				</button>
			</div>
			{/* Search Input Row */}
			<div className="px-4 py-3 bg-richblack-900/60 border-b border-white/5">
				<div className="relative w-full max-w-md mx-auto">
					<FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-richblack-400" />
					<input
						id="search"
						type="text"
						placeholder="Search users..."
						className="w-full bg-richblack-800 text-richblack-5 placeholder:text-richblack-400 pl-12 pr-4 py-2.5 rounded-full border border-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition"
						onChange={(e) => setInputUserName(e.target.value)}
					/>
				</div>
			</div>

			{/* User List */}
			<div className="flex flex-col w-full px-4 py-3 space-y-3 overflow-y-auto scroll-style h-[66vh]">
				{selectedUsers.length === 0 && isChatLoading ? (
					<ChatShimmer />
				) : selectedUsers.length === 0 ? (
					<div className="w-full h-full flex justify-center items-center text-richblack-300">
						<h1 className="text-base font-semibold">No users found.</h1>
					</div>
				) : (
					selectedUsers.map((user) => {
						const online = showPresence && isUserOnline(user._id, onlineUserIds);
						return (
							<button
								key={user._id}
								onClick={() => handleCreateChat(user._id)}
								className="w-full flex items-center gap-3 p-3 border border-white/5 rounded-2xl bg-richblack-800/60 text-white hover:bg-richblack-700/80 hover:border-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition shadow hover:shadow-lg"
							>
								<div className="relative shrink-0">
									<img
										src={user?.image}
										alt="user"
										className="h-12 w-12 rounded-full object-cover border-2 border-transparent"
									/>
									{online && <span className="presence-dot" />}
								</div>
								<div className="flex-1 text-left">
									<div className="font-semibold text-base capitalize truncate">
										{user?.firstName} {user?.lastName}
									</div>
									<div className="text-sm text-richblack-300 flex items-center gap-2">
										<span className="truncate">Reg No: {user.regNo}</span>
										<span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-white/5 border border-white/10">
											{user.accountType === "mentor" ? "Mentor" : "Student"}
										</span>
									</div>
								</div>
							</button>
						);
					})
				)}
			</div>
		</>
	);
};

export default UserSearch;

