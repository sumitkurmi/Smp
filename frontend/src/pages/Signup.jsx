import { useState } from "react";
import { FaEnvelope, FaIdBadge, FaLock, FaUser } from "react-icons/fa";
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 py-8 bg-gradient-to-br from-richblack-900 to-richblack-800 text-richblack-5">
      <div className="w-full max-w-md bg-richblack-800 border border-richblack-600 rounded-lg p-6 shadow-md">
        <h2 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200 mb-6">
          Sign Up
        </h2>

        <form onSubmit={handleSignup} className="space-y-6">
          {/* First Name */}
          <div className="flex flex-col relative">
            <label htmlFor="firstName" className="mb-1 text-sm font-medium text-richblack-200">
              First Name
            </label>
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
            <input
              type="text"
              id="firstName"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="pl-10 px-4 py-3 rounded-xl bg-richblack-700 border border-richblack-600 text-white placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
            />
          </div>

          {/* Last Name */}
          <div className="flex flex-col relative">
            <label htmlFor="lastName" className="mb-1 text-sm font-medium text-richblack-200">
              Last Name
            </label>
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
            <input
              type="text"
              id="lastName"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="pl-10 px-4 py-3 rounded-xl bg-richblack-700 border border-richblack-600 text-white placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col relative">
            <label htmlFor="email" className="mb-1 text-sm font-medium text-richblack-200">
              Email Address
            </label>
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
            <input
              type="email"
              id="email"
              placeholder="john.regno@mnnit.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 px-4 py-3 rounded-xl bg-richblack-700 border border-richblack-600 text-white placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
            />
          </div>

          {/* Registration Number */}
          <div className="flex flex-col relative">
            <label htmlFor="regNo" className="mb-1 text-sm font-medium text-richblack-200">
              Registration Number
            </label>
            <FaIdBadge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
            <input
              type="text"
              id="regNo"
              placeholder="2023000"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              className="pl-10 px-4 py-3 rounded-xl bg-richblack-700 border border-richblack-600 text-white placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
            />
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
              className="px-4 py-3 rounded-xl bg-richblack-700 border border-richblack-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          {/* Password */}
          <div className="flex flex-col relative">
            <label htmlFor="password" className="mb-1 text-sm font-medium text-richblack-200">
              Password
            </label>
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
            <input
              type={isShow ? "text" : "password"}
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pl-10 pr-12 px-4 rounded-xl bg-richblack-700 border border-richblack-600 text-white placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={load !== ""}
            className="w-full py-3 text-lg font-semibold rounded-full bg-gradient-to-r from-yellow-400 to-yellow-200 text-richblack-900 hover:from-yellow-300 hover:to-yellow-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {load || "Sign Up"}
          </button>

          {/* Link to Sign In */}
          <div className="text-center mt-4 text-sm text-richblack-200">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-pink-400 hover:underline hover:text-pink-300 transition"
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
