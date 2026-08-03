import { useState } from "react";
import { FaCalendarCheck, FaEnvelope, FaLock, FaPaperPlane, FaUsers } from "react-icons/fa";
import { PiEye, PiEyeClosedLight } from "react-icons/pi";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addAuth } from "../redux/slices/authSlice";
import { checkValidSignInFrom } from "../utils/validate";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [load, setLoad] = useState("");
  const [isShow, setIsShow] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logInUser = (e) => {
    toast.loading("Wait until you SignIn");
    e.target.disabled = true;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((json) => {
        setLoad("");
        e.target.disabled = false;
        toast.dismiss();

        if (json.token) {
          localStorage.setItem("token", json.token);
          dispatch(addAuth(json.data));
          navigate("/");
          toast.success(json?.message);
        } else {
          toast.error(json?.message);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoad("");
        toast.dismiss();
        toast.error("Error: " + err.code);
        e.target.disabled = false;
      });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      const error = checkValidSignInFrom(email, password);
      if (error) return toast.error(error);
      setLoad("Loading...");
      logInUser(e);
    } else {
      toast.error("Required: All Fields");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] px-4 py-10 bg-gradient-to-br from-richblack-900 to-richblack-800">
      <div className="w-full max-w-5xl bg-richblack-800/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2 modal-enter">
        {/* Left: Brand Panel */}
        <div className="hidden md:flex flex-col justify-center items-center gap-6 bg-gradient-to-br from-yellow-400/20 via-richblack-800 to-richblack-900 p-10 border-r border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-300 flex items-center justify-center shadow-2xl shadow-yellow-500/30">
              <FaPaperPlane size={24} className="text-black" />
            </div>
            <span className="text-3xl font-extrabold text-gradient-gold">SMP HUB</span>
          </div>
          <p className="text-center text-richblack-300 max-w-sm">
            Collaboration & Interaction for Students at MNNIT. Chat in real-time,
            schedule meetings, and track attendance — all in one place.
          </p>
          <div className="space-y-3 w-full max-w-sm">
            <div className="flex items-center gap-3 glass-light rounded-xl p-3">
              <FaUsers className="text-yellow-400" size={20} />
              <span className="text-sm text-richblack-25">Real-time group & private chat</span>
            </div>
            <div className="flex items-center gap-3 glass-light rounded-xl p-3">
              <FaCalendarCheck className="text-blue-400" size={20} />
              <span className="text-sm text-richblack-25">Schedule meetings & track attendance</span>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200 mb-8">
            Sign In
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="mb-1 text-sm font-medium text-richblack-200"
              >
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
                <input
                  type="email"
                  id="email"
                  placeholder="you@mnnit.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-10 px-4 rounded-xl bg-richblack-700/70 border border-white/10 text-white placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label
                htmlFor="password"
                className="mb-1 text-sm font-medium text-richblack-200"
              >
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
                <input
                  type={isShow ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-10 pr-12 px-4 rounded-xl bg-richblack-700/70 border border-white/10 text-white placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                />
                {password && (
                  <span
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-richblack-300 hover:text-white transition"
                    onClick={() => setIsShow(!isShow)}
                    title={isShow ? "Hide Password" : "Show Password"}
                  >
                    {isShow ? <PiEyeClosedLight size={20} /> : <PiEye size={20} />}
                  </span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={load !== ""}
              className="w-full py-3 text-lg font-semibold rounded-full bg-gradient-to-r from-yellow-400 to-yellow-200 text-richblack-900 hover:from-yellow-300 hover:to-yellow-100 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20"
            >
              {load || "Sign In"}
            </button>

            {/* Links */}
            <div className="flex justify-end text-sm text-richblack-200 mt-4">
              <Link to="/signup" className="hover:text-yellow-400 transition">
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

