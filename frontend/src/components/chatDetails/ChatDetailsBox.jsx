import { useState } from "react";
import { CiCircleInfo } from "react-icons/ci";
import { HiOutlineUsers } from "react-icons/hi2";
import { IoSettingsOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import Attendance from "./Attendance";
import ChatSetting from "./ChatSetting";
import Member from "./Member";
import Overview from "./Overview";

const ChatDetailsBox = () => {
  const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
  const [detailView, setDetailView] = useState("overview");

  const menuItems = [
    {
      label: "Overview",
      icon: <CiCircleInfo fontSize={18} title="Overview" />,
      value: "overview",
    },
    {
      label: "Members",
      icon: <HiOutlineUsers fontSize={18} title="Members" />,
      value: "members",
      show: selectedChat?.isGroupChat,
    },
    {
      label: "Attendance",
      icon: <IoSettingsOutline fontSize={18} title="Attendance" />,
      value: "attendance",
      show: selectedChat?.isGroupChat,
    },
    {
      label: "Setting",
      icon: <IoSettingsOutline fontSize={18} title="Settings" />,
      value: "setting",
    },
  ];

  return (
    <div className="flex w-full h-[60vh] bg-richblack-800 rounded-lg overflow-hidden shadow-lg">
      {/* Sidebar Tabs */}
      <nav className="w-28 sm:w-32 md:w-36 lg:w-40 bg-richblack-700 p-4 flex flex-col space-y-2">
        {menuItems
          .filter(item => item.show !== false)
          .map(({ label, icon, value }) => (
            <button
              key={value}
              onClick={() => setDetailView(value)}
              title={label}
              aria-label={label}
              className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer
                ${detailView === value
                  ? 'bg-yellow-400 text-black'
                  : 'text-richblack-200 hover:bg-richblack-600'}
              `}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-sm">{label}</span>
            </button>
          ))}
      </nav>

      {/* View Container */}
      <div className="flex-1 bg-richblack-900 p-6 overflow-y-auto scroll-style">
        {detailView === "overview" && <Overview />}
        {detailView === "members" && <Member />}
        {detailView === "attendance" && <Attendance />}
        {detailView === "setting" && <ChatSetting />}
      </div>
    </div>
  );
};

export default ChatDetailsBox;
