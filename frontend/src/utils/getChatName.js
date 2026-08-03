import GroupLogo from "../assets/group.png";
const getChatName = (chat, authUserId) => {
	if (!chat) return "";
	const chatName = chat?.chatName === "Messenger"
		? authUserId === chat.users?.[0]?._id
			? ((chat.users?.[1]?.firstName || "User") + " " + (chat.users?.[1]?.lastName || "")).trim()
			: ((chat.users?.[0]?.firstName || "User") + " " + (chat.users?.[0]?.lastName || "")).trim()
		: (chat?.chatName || "Chat");
	return chatName;
};
export const getChatImage = (chat, authUserId) => {
	if (!chat) return GroupLogo;
	const ImageLogo =
		chat?.chatName == "Messenger"
			? authUserId == chat.users?.[0]?._id
				? chat.users?.[1]?.image || GroupLogo
				: chat.users?.[0]?.image || GroupLogo
			: GroupLogo;
	return ImageLogo;
};
export default getChatName;

