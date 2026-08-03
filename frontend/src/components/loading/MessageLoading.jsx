import { AiOutlineLoading3Quarters } from "react-icons/ai";

const MessageLoading = () => {
	return (
<div className="flex-1 min-h-0 flex items-center justify-center w-full overflow-hidden text-white">
			<AiOutlineLoading3Quarters className="animate-spin text-2xl opacity-80" />
		</div>
	);
};

export default MessageLoading;
