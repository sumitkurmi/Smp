import { useState } from "react";
import { FaEnvelope, FaUser } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addAuth } from "../redux/slices/authSlice";
import { setLoading } from "../redux/slices/conditionSlice";

const UpdateProfile = ({ onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.auth);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [image, setImage] = useState(user?.image || "");
  const [preview, setPreview] = useState(user?.image || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    dispatch(setLoading(true));
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, image }),
      });
      const json = await res.json();
      if (res.ok && json?.data) {
        dispatch(addAuth(json.data));
        toast.success(json.message || "Profile updated");
        onClose && onClose();
      } else {
        toast.error(json?.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-gradient-to-br from-richblack-800 to-richblack-900 border border-white/10 rounded-2xl p-8 relative shadow-2xl modal-enter">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-richblack-300 hover:text-yellow-400 transition"
          title="Close"
        >
          <MdOutlineClose size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gradient-gold text-center mb-6">
          Update Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar preview */}
          <div className="flex justify-center">
            <img
              src={preview || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(firstName + " " + lastName)}`}
              alt="avatar"
              className="h-24 w-24 rounded-full object-cover border-4 border-yellow-400/70"
            />
          </div>

          <div className="flex flex-col relative">
            <label className="mb-1 text-sm font-medium text-richblack-200">First Name</label>
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-12 pl-10 pr-4 rounded-xl bg-richblack-700/70 border border-white/10 text-white placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              placeholder="First Name"
            />
          </div>

          <div className="flex flex-col relative">
            <label className="mb-1 text-sm font-medium text-richblack-200">Last Name</label>
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-12 pl-10 pr-4 rounded-xl bg-richblack-700/70 border border-white/10 text-white placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              placeholder="Last Name"
            />
          </div>

          <div className="flex flex-col relative">
            <label className="mb-1 text-sm font-medium text-richblack-200">Avatar URL (optional)</label>
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
            <input
              type="url"
              value={image}
              onChange={(e) => {
                setImage(e.target.value);
                setPreview(e.target.value);
              }}
              className="h-12 pl-10 pr-4 rounded-xl bg-richblack-700/70 border border-white/10 text-white placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-black font-semibold hover:from-yellow-300 hover:to-yellow-200 transition shadow-lg shadow-yellow-500/20"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;

