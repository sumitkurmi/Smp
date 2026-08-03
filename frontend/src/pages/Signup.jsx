import { useState } from "react";
import { FaCalendarCheck, FaEnvelope, FaIdBadge, FaLock, FaPaperPlane, FaUser, FaUsers } from "react-icons/fa";
import { PiEye, PiEyeClosedLight } from "react-icons/pi";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { checkValidSignUpFrom } from "../utils/validate";

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [regNo, setRegNo] = useState("");
  const [accountType, setAccountType] = useState("student");
  const [password, setPassword] = useState("");
  const [isShow, setIsShow] = useState(false);
  const [load, setLoad] = useState("");
  const navigate = useNavigate();

  const signUpUser = (e) => {
    toast.loading("Wait until you SignUp");
    e.target.disabled = true;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password, regNo, accountType }),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        toast.dismiss();
        setLoad("");
        e.target.disabled = false;

        if (!res.ok) {
          throw new Error(json?.message || "Signup failed");
        }

        if (json.token) {
          toast.success(json?.message || "Signup successful");
          navigate("/signin");
        } else {
          throw new Error(json?.message || "Signup failed");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        toast.dismiss();
        setLoad("");
        e.target.disabled = false;
        toast.error(err.message || "Unable to connect to the server. Check that the backend is running.");
      });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (firstName && lastName && email && password && regNo) {
      const error = checkValidSignUpFrom(firstName, lastName, email, password, regNo);
      if (error) return toast.error(error);
      setLoad("Loading...");
      signUpUser(e);
    } else {
      toast.error("Required: All Fields");
    }
  };

  const inputBase = "pl-10 px-4 py-3 rounded-xl bg-richblack-700/70 border border-white/10 text-white placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition w-full";

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 py-8 bg-gradient-to-br from-richblack-900 to-richblack-800 text-richblack-5">
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
            Join the collaborative hub for mentors & students at MNNIT. Create groups,
            schedule meetings, and stay connected.
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
          <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200 mb-6">
            Sign Up
          </h2>

          <form onSubmit={handleSignup} className="space-y-5">
{/* First Name */}
            <div className="flex flex-col">
              <label htmlFor="firstName" className="mb-1 text-sm font-medium text-richblack-200">
                First Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
                <input
                  type="text"
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputBase}
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="flex flex-col">
              <label htmlFor="lastName" className="mb-1 text-sm font-medium text-richblack-200">
                Last Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
                <input
                  type="text"
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputBase}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label htmlFor="email" className="mb-1 text-sm font-medium text-richblack-200">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
                <input
                  type="email"
                  id="email"
                  placeholder="john.20230000@mnnit.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputBase}
                />
              </div>
            </div>

            {/* Registration Number */}
            <div className="flex flex-col">
              <label htmlFor="regNo" className="mb-1 text-sm font-medium text-richblack-200">
                Registration Number
              </label>
              <div className="relative">
                <FaIdBadge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
                <input
                  type="text"
                  id="regNo"
                  placeholder="20230000"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className={inputBase}
                />
              </div>
            </div>

            {/* Account Type */}
            <div className="flex flex-col">
              <label htmlFor="accountType" className="mb-1 text-sm font-medium text-richblack-200">
                Account Type
              </label>
              <select
                id="accountType"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="px-4 py-3 rounded-xl bg-richblack-700/70 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              >
                <option value="student">Student</option>
                <option value="mentor">Mentor</option>
              </select>
            </div>

{/* Password */}
            <div className="flex flex-col">
              <label htmlFor="password" className="mb-1 text-sm font-medium text-richblack-200">
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
                  className={inputBase + " pr-12 h-12"}
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
              {load || "Sign Up"}
            </button>

            {/* Link to Sign In */}
            <div className="text-center mt-4 text-sm text-richblack-200">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-yellow-400 hover:underline hover:text-yellow-300 transition"
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

