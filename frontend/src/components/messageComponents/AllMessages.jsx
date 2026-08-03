import { Fragment, useEffect, useRef, useState } from "react";
import { CgChevronDoubleDown } from "react-icons/cg";
import { FaReply } from "react-icons/fa";
import { VscCheckAll } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { updateReaction } from "../../redux/slices/messageSlice";
import socket from "../../socket/socket";
import {
	SimpleDateMonthDay,
	SimpleTime,
} from "../../utils/formateDateTime";
import MessageReactions from "./MessageReactions";

const AllMessages = ({ allMessage, authUserId, onReply }) => {
	const chatBox = useRef();
	const adminId = authUserId;
	const isTyping = useSelector((store) => store?.condition?.isTyping);
	const dispatch = useDispatch();

	const [scrollShow, setScrollShow] = useState(true);

	const handleScrollDownChat = () => {
		if (chatBox.current) {
			chatBox.current.scrollTo({
				top: chatBox.current.scrollHeight,
			});
		}
	};

	useEffect(() => {
		handleScrollDownChat();
		if (
			chatBox.current.scrollHeight === chatBox.current.clientHeight
		) {
			setScrollShow(false);
		}

		const handleScroll = () => {
			const current = chatBox.current;
			const scrolledToBottom =
				current.scrollTop + current.clientHeight >=
				current.scrollHeight - 30;
			setScrollShow(!scrolledToBottom);
		};

		const chatRef = chatBox.current;
		chatRef.addEventListener("scroll", handleScroll);
		return () => chatRef.removeEventListener("scroll", handleScroll);
	}, [allMessage, isTyping]);

	// Listen for reaction broadcast
	useEffect(() => {
		const reactionHandler = (updatedMessage) => {
			dispatch(updateReaction(updatedMessage));
		};
		socket.on("message reacted", reactionHandler);
		return () => socket.off("message reacted", reactionHandler);
	}, [dispatch]);

	return (
		<>
			{scrollShow && (
				<div
					className="absolute bottom-16 right-4 z-20 cursor-pointer text-richblack-200 bg-richblack-800/90 hover:bg-richblack-700 hover:text-white p-1.5 rounded-full border border-richblack-600"
					onClick={handleScrollDownChat}
				>
					<CgChevronDoubleDown title="Scroll Down" fontSize={24} />
				</div>
			)}

			<div
				className="flex-1 flex flex-col w-full px-3 py-1 space-y-1 overflow-y-auto scroll-style min-h-0 bg-gradient-to-b from-richblack-950 to-richblack-900"
				ref={chatBox}
			>
				{allMessage?.map((message, idx) => {
					const isMyMessage = message?.sender?._id === adminId;
					const isGroup = message?.chat?.isGroupChat;
					const prevDate = new Date(allMessage[idx - 1]?.updatedAt).toDateString();
					const currDate = new Date(message?.updatedAt).toDateString();
					const showDateHeader = prevDate !== currDate;
					const hasReactions =
						message?.reactions && Object.keys(message.reactions).length > 0;

					return (
						<Fragment key={message._id}>
							{showDateHeader && (
								<div className="sticky top-0 z-10 flex justify-center">
									<span className="text-xs font-light mb-2 mt-1 text-richblack-200 bg-richblack-800 h-7 w-fit px-5 rounded-full flex items-center justify-center border border-white/10">
										{SimpleDateMonthDay(message?.updatedAt)}
									</span>
								</div>
							)}

							<div className={`flex items-start ${isMyMessage ? 'justify-end' : 'justify-start'} gap-2 message-enter`}>
								{isGroup && !isMyMessage && (
									<img src={message.sender.image} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
								)}

								<div className={`relative max-w-[75%] min-w-[6rem] flex flex-col ${
									isMyMessage
										? 'bg-gradient-to-br from-yellow-400 to-yellow-300 text-black rounded-2xl rounded-br-sm shadow-lg shadow-yellow-500/20'
										: 'bg-richblack-800 text-richblack-5 rounded-2xl rounded-bl-sm border border-white/10 shadow-lg'
									}`}>
									{/* Reply preview */}
									{message?.replyPreview && (
										<div className={`px-2.5 pt-2 pb-1 mb-1 rounded-lg text-xs border-l-2 ${
											isMyMessage ? 'bg-black/10 border-black/30' : 'bg-white/5 border-yellow-400/60'
										}`}>
											<span className={`font-semibold ${isMyMessage ? 'text-black/70' : 'text-yellow-300'}`}>
												Reply to:
											</span>
											<p className={`truncate ${isMyMessage ? 'text-black/70' : 'text-richblack-200'}`}>
												{message.replyPreview}
											</p>
										</div>
									)}

									{isGroup && !isMyMessage && (
										<span className="text-xs font-semibold text-yellow-300 mb-1 px-2.5 pt-2">
											{message.sender.firstName}
										</span>
									)}

									{/* Text */}
									<div className="px-2.5 py-2">
										{message.message && message.message !== "imagefiles" && message.message !== "videofiles" && (
											<span className={`${isMyMessage ? 'text-base' : 'text-sm'} leading-relaxed break-words`}>
												{message.message}
											</span>
										)}
									</div>

									{/* Images */}
									{message.image_urls?.length > 0 && (
										<div className="flex flex-wrap gap-2 px-2.5 pb-1">
											{message.image_urls.map((url, idx) => (
												<img
													key={idx}
													src={url}
													alt={`uploaded-img-${idx}`}
													className="max-w-[200px] max-h-[200px] rounded-xl object-cover"
												/>
											))}
										</div>
									)}

									{/* Videos */}
									{message.video_urls?.length > 0 && (
										<div className="flex flex-wrap gap-2 px-2.5 pb-1">
											{message.video_urls.map((url, idx) => (
												<video
													key={idx}
													src={url}
													controls
													className="max-w-[200px] max-h-[200px] rounded-xl object-cover"
												/>
											))}
										</div>
									)}

									{/* Generic files */}
									{message.files?.length > 0 && (
										<div className="flex flex-col gap-2 px-2.5 pb-1">
											{message.files.map((file, idx) => {
												const fileName = file.name || "download";
												let downloadUrl = file.url;

												if (
													downloadUrl.includes("cloudinary.com") &&
													downloadUrl.includes("/raw/upload/")
												) {
													downloadUrl = downloadUrl.replace(
														"/upload/",
														"/upload/fl_attachment/"
													);
												}

												return (
													<div key={idx} className="flex items-center gap-2">
														<span className={`${isMyMessage ? 'text-black/80' : 'text-white'} break-all text-sm`}>{fileName}</span>
														<a
															href={downloadUrl}
															download={fileName}
															target="_blank"
															rel="noopener noreferrer"
															className="text-blue-400 underline"
															style={{ wordBreak: "break-word" }}
														>
															Download
														</a>
													</div>
												);
											})}
										</div>
									)}

									{/* Reactions */}
									{hasReactions && (
										<div className="px-2.5 pb-1">
											<MessageReactions message={message} />
										</div>
									)}

									{/* Footer: time + reply button */}
									<div className={`flex items-center justify-end gap-2 px-2.5 pb-1.5 pt-1 ${isMyMessage ? '' : ''}`}>
										<button
											onClick={() => onReply && onReply(message)}
											title="Reply"
											className={`p-1 rounded-full transition ${
												isMyMessage ? 'text-black/60 hover:bg-black/10' : 'text-richblack-300 hover:bg-white/10'
											}`}
										>
											<FaReply size={11} />
										</button>
										<span className={`flex items-center text-[10px] ${isMyMessage ? 'text-black/60' : 'text-richblack-400'} gap-1`}>
											{SimpleTime(message.updatedAt)}
											{isMyMessage && <VscCheckAll fontSize={16} />}
										</span>
									</div>
								</div>

								{isGroup && isMyMessage && (
									<img src={message.sender.image} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
								)}
							</div>
						</Fragment>
					);
				})}

				{isTyping && (
					<div id="typing-animation">
						<span></span>
						<span></span>
						<span></span>
					</div>
				)}
			</div>
		</>
	);
};

export default AllMessages;

