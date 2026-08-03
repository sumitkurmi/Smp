import { FiMessageSquare } from "react-icons/fi";
import { HiOutlineUsers } from "react-icons/hi2";
import { IoCalendarOutline } from "react-icons/io5";
import { useSelector } from "react-redux";

const ChatNotSelected = () => {
	const myChat = useSelector((store) => store?.myChat?.chat || []);
	const user = useSelector((store) => store?.auth);

	const groupCount = myChat.filter((c) => c.isGroupChat).length;
	const dmCount = myChat.length - groupCount;
	const meetingsCount = myChat.reduce(
		(acc, c) => acc + (c?.meetingsCount || 0),
		0
	);

	const stats = [
		{
			label: "Direct Chats",
			value: dmCount,
			icon: <FiMessageSquare className="text-yellow-400" size={22} />,
			color: "from-yellow-500/20 to-yellow-500/5",
		},
		{
			label: "Groups",
			value: groupCount,
			icon: <HiOutlineUsers className="text-blue-400" size={22} />,
			color: "from-blue-500/20 to-blue-500/5",
		},
		{
			label: "Meetings",
			value: meetingsCount,
			icon: <IoCalendarOutline className="text-purple-400" size={22} />,
			color: "from-purple-500/20 to-purple-500/5",
		},
	];

	return (
		<div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-richblack-900 via-richblack-900 to-richblack-800 overflow-y-auto scroll-style p-4">
			<div className="flex flex-col items-center gap-6 w-full max-w-lg">
				{/* Hero Icon */}
				<div className="relative">
					<div className="absolute inset-0 bg-yellow-400/30 blur-2xl rounded-full" />
					<div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-300 flex items-center justify-center shadow-2xl shadow-yellow-500/30">
						<FiMessageSquare size={40} className="text-black" />
					</div>
				</div>

				<div className="text-center space-y-2">
					<h1 className="text-2xl font-bold text-gradient-gold">
						Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
					</h1>
					<p className="text-sm text-richblack-300">
						Select a conversation to start messaging, or start a new one.
					</p>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-3 gap-3 w-full">
					{stats.map((s) => (
						<div
							key={s.label}
							className={`bg-gradient-to-br ${s.color} border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 glass-light`}
						>
							{s.icon}
							<span className="text-2xl font-bold">{s.value}</span>
							<span className="text-xs text-richblack-300">{s.label}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ChatNotSelected;

