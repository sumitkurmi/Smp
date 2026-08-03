import { useEffect, useState } from "react";
import { FaCalendarCheck, FaUserCheck, FaUserTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { canSeePresence, isUserOnline } from "../../utils/presence";

const Attendance = () => {
  const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
  const auth = useSelector((store) => store?.auth);
  const onlineUserIds = useSelector((store) => store?.online?.onlineUserIds || []);
  const [meetings, setMeetings] = useState([]);
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchMeetings = async () => {
    if (!selectedChat?._id) return;
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/meetings/${selectedChat._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json?.data) setMeetings(json.data);
  };

  useEffect(() => {
    fetchMeetings();
  }, [selectedChat?._id]);

  const assignMeeting = async (e) => {
    e.preventDefault();
    if (!title || !meetingDate || !meetingTime) {
      return toast.error("Please fill meeting title, date, and time");
    }

    const scheduledAtValue = `${meetingDate}T${meetingTime}`;
    const scheduledAtTime = new Date(scheduledAtValue);
    if (isNaN(scheduledAtTime.getTime())) {
      return toast.error("Please enter a valid meeting date and time");
    }
    if (scheduledAtTime <= new Date()) {
      return toast.error("Meeting time must be in the future");
    }

    const scheduledAt = scheduledAtTime.toISOString();

    setLoading(true);
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/meeting`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ chatId: selectedChat._id, title, scheduledAt }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) return toast.error(json?.message || "Unable to assign meeting");
    setTitle("");
    setMeetingDate("");
    setMeetingTime("");
    toast.success("Meeting assigned to the group");
    fetchMeetings();
  };

  const markAttendance = async (meetingId, studentId, status) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ meetingId, studentId, status }),
    });
    const json = await res.json();
    if (!res.ok) return toast.error(json?.message || "Unable to update attendance");
    toast.success("Attendance updated");
    fetchMeetings();
  };

  const isMentor = auth?.accountType === "mentor" || selectedChat?.groupAdmin?._id === auth?._id;

  const getDisplayName = (record) => {
    if (!record?.student) return "Student";
    if (record.student.name) return record.student.name;
    const fullName = `${record.student.firstName || ""} ${record.student.lastName || ""}`.trim();
    return fullName || record.student.email || "Student";
  };

  const showPresence = canSeePresence(auth?.accountType);

  return (
    <div className="space-y-6">
      {isMentor && (
        <form onSubmit={assignMeeting} className="space-y-3 rounded-xl border border-white/10 bg-richblack-800/60 p-4 glass-light">
          <h3 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
            <FaCalendarCheck /> Schedule a meeting
          </h3>
          <p className="text-sm text-richblack-300">Create a meeting for this group. Students will see it here and you can mark attendance after the session.</p>
          <input
            className="w-full rounded-lg border border-white/10 bg-richblack-900/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition"
            placeholder="Meeting title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-richblack-300">Meeting date</label>
              <input
                className="w-full rounded-lg border border-white/10 bg-richblack-900/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition"
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-richblack-300">Meeting time</label>
              <input
                className="w-full rounded-lg border border-white/10 bg-richblack-900/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition"
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-300 px-4 py-2 font-semibold text-black shadow-lg shadow-yellow-500/20" disabled={loading}>
            {loading ? "Assigning..." : "Assign meeting"}
          </button>
        </form>
      )}

      {meetings.length === 0 && <p className="text-richblack-300">No meetings scheduled yet.</p>}

      {meetings.map((meeting) => (
        <div key={meeting._id} className="rounded-xl border border-white/10 bg-richblack-800/60 p-4 glass-light">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">{meeting.meetingTitle}</h4>
              <p className="text-sm text-richblack-300">{meeting.scheduledAt ? new Date(meeting.scheduledAt).toLocaleString() : "No scheduled time"}</p>
            </div>
          </div>

          <div className="space-y-2">
            {meeting.records?.map((record) => {
              const online = showPresence && isUserOnline(record.student._id, onlineUserIds);
              return (
                <div key={record.student._id} className="flex flex-col gap-2 rounded-lg bg-richblack-900/60 px-3 py-2 sm:flex-row sm:items-center sm:justify-between border border-white/5">
                  <span className="font-medium text-white flex items-center gap-2">
                    <span className="relative inline-block">
                      <img src={record.student.image} alt="" className="h-7 w-7 rounded-full object-cover" />
                      {online && <span className="presence-dot scale-75" />}
                    </span>
                    {getDisplayName(record)}
                  </span>
                  <div className="flex items-center gap-2">
                    {isMentor ? (
                      <>
                        <button className={`rounded-lg px-3 py-1 text-sm font-semibold transition ${record.status === "present" ? "bg-green-600 text-white" : "bg-richblack-700 text-richblack-100 hover:bg-green-600/60"}`} onClick={() => markAttendance(meeting._id, record.student._id, "present")}>
                          <FaUserCheck className="inline mr-1" /> Present
                        </button>
                        <button className={`rounded-lg px-3 py-1 text-sm font-semibold transition ${record.status === "absent" ? "bg-red-600 text-white" : "bg-richblack-700 text-richblack-100 hover:bg-red-600/60"}`} onClick={() => markAttendance(meeting._id, record.student._id, "absent")}>
                          <FaUserTimes className="inline mr-1" /> Absent
                        </button>
                      </>
                    ) : (
                      <span className={`rounded-lg px-2 py-1 text-sm ${record.status === "present" ? "bg-green-600" : record.status === "absent" ? "bg-red-600" : "bg-yellow-600"}`}>
                        {record.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Attendance;

