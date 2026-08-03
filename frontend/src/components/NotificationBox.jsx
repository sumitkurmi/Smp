import { FaCalendarCheck } from "react-icons/fa";
import { MdOutlineClose, MdOutlineMail } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setNotificationBox } from "../redux/slices/conditionSlice";
import {
  addSelectedChat,
  removeNewMessageRecieved,
} from "../redux/slices/myChatSlice";
import { SimpleDateAndTime } from "../utils/formateDateTime";
import getChatName from "../utils/getChatName";

const NotificationBox = () => {
  const dispatch = useDispatch();
  const authUserId = useSelector((store) => store?.auth?._id);
  const newMessageRecieved = useSelector(
    (store) => store?.myChat?.newMessageRecieved
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-xl bg-richblack-800 border border-richblack-600 rounded-lg text-richblack-5 p-6 relative shadow-lg">
        {/* Close Button */}
        <button
          title="Close"
          onClick={() => dispatch(setNotificationBox(false))}
          className="absolute top-4 right-4 text-richblack-300 hover:text-yellow-400 transition"
        >
          <MdOutlineClose size={24} />
        </button>

        {/* Header */}
        <h2 className="text-3xl font-semibold text-center text-yellow-50 mb-4">
          Notifications
        </h2>

        {/* Summary */}
        {newMessageRecieved?.length > 0 && (
          <p className="text-sm text-richblack-300 text-center mb-4">
            You have {newMessageRecieved.length} new notification
            {newMessageRecieved.length > 1 ? "s" : ""}
          </p>
        )}

        {/* Notification List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto scroll-style pr-2">
          {newMessageRecieved?.length === 0 ? (
            <div className="w-full text-center text-base font-medium text-richblack-100">
              You have 0 new notifications
            </div>
          ) : (
            newMessageRecieved.map((message) => (
              <button
                key={message._id}
                onClick={() => {
                  dispatch(removeNewMessageRecieved(message));
                  dispatch(addSelectedChat(message.chat));
                  dispatch(setNotificationBox(false));
                }}
className="w-full flex items-start gap-3 bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 p-4 rounded-lg transition"
              >
                {message.meeting ? (
                  <FaCalendarCheck size={20} className="text-yellow-400 mt-1" />
                ) : (
                  <MdOutlineMail size={20} className="text-yellow-400 mt-1" />
                )}
                <div className="flex-1 text-left">
                  {message.meeting ? (
                    <>
                      <p className="text-sm text-richblack-25">
                        <span className="font-semibold text-yellow-300">📅 New meeting scheduled</span>
                        {message.chat?.isGroupChat && (
                          <> in <span className="text-cyan-300">{getChatName(message.chat, authUserId)}</span></>
                        )}{" "}by <span className="font-medium text-yellow-300">{message.mentorName || message.sender?.firstName}</span>
                      </p>
                      <p className="text-sm text-green-400 mt-1">
                        <span className="font-semibold text-white">{message.meetingTitle}</span>
                      </p>
                      {message.scheduledAt && (
                        <p className="text-xs text-blue-300 mt-1">
                          🕒 {new Date(message.scheduledAt).toLocaleString()}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-richblack-25">
                      <span className="font-semibold text-yellow-300">New message</span>
                      {message.chat.isGroupChat && (
                        <> in <span className="text-cyan-300">{getChatName(message.chat, authUserId)}</span></>
                      )}{" "}from <span className="font-medium text-yellow-300">{message.sender.firstName}</span>: <span className="text-green-400">{message.message}</span>
                    </p>
                  )}
                  <p className="text-xs text-richblack-400 mt-2 text-right">
                    {SimpleDateAndTime(message.createdAt)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationBox;
