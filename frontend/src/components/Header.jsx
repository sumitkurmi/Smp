// Header.jsx
import { useEffect } from "react";
import { IoLogOutOutline } from "react-icons/io5";
import { MdNotificationsActive } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/logo2.jpeg";
import { addAuth } from "../redux/slices/authSlice";
import { setLoading, setNotificationBox } from "../redux/slices/conditionSlice";
import handleScrollTop from "../utils/handleScrollTop";

const Header = () => {
  const location = useLocation();
  const user = useSelector((store) => store.auth);
  const rawToken = localStorage.getItem("token");
  const token = rawToken && rawToken !== "null" && rawToken !== "undefined" ? rawToken : null;
  const isLoggedIn = Boolean(token || user?._id);
  const newMessageRecieved = useSelector(
    (store) => store?.myChat?.newMessageRecieved
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Generate avatar URL from user initials (only if user data is available)
  const avatarUrl = user?.firstName && user?.lastName
    ? `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.firstName + ' ' + user.lastName)}`
    : null;

  const getAuthUser = (token) => {
    dispatch(setLoading(true));
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        dispatch(addAuth(json.data));
        dispatch(setLoading(false));
      })
      .catch((err) => {
        console.log(err);
        dispatch(setLoading(false));
      });
  };

  useEffect(() => {
    if (token) {
      getAuthUser(token);
    } else {
      navigate("/signin");
    }
  }, [token]);

  const { pathname } = useLocation();
  useEffect(() => {
    handleScrollTop();
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
    navigate("/signin");
  };

  useEffect(() => {
    let prevScrollPos = window.pageYOffset;
    const handleScroll = () => {
      let currentScrollPos = window.pageYOffset;
      if (prevScrollPos < currentScrollPos && currentScrollPos > 80) {
        document.getElementById("header").classList.add("hiddenbox");
      } else {
        document.getElementById("header").classList.remove("hiddenbox");
      }
      prevScrollPos = currentScrollPos;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      id="header"
      className="w-full h-16 fixed top-0 z-50 md:h-20 flex justify-between items-center pl-16 pr-6 font-semibold glass border-b border-white/10 text-white transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        <Link to={"/"} className="flex items-center gap-3 group">
          <div className="relative">
            <img src={Logo} alt="ChatApp" className="h-11 w-11 rounded-full object-cover ring-2 ring-yellow-400/60 group-hover:ring-yellow-400 transition" />
          </div>
          <span className="text-xl font-extrabold tracking-wide text-gradient-gold">
            SMP HUB
          </span>
        </Link>
      </div>

      {isLoggedIn ? (
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => dispatch(setNotificationBox(true))}
            title={`You have ${newMessageRecieved.length} new notifications`}
            className="relative p-2 rounded-full glass-light hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
          >
            <MdNotificationsActive fontSize={22} className="text-yellow-400" />
            {newMessageRecieved.length > 0 && (
              <span className="absolute -top-1 -right-1 text-xs font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 text-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg badge-pop">
                {newMessageRecieved.length}
              </span>
            )}
          </button>
          {/* Profile avatar */}
          <Link to="/profile" className="flex items-center gap-2 hover:bg-white/5 px-2 py-1.5 rounded-full transition">
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="avatar"
                className="hidden md:block w-9 h-9 rounded-full object-cover border-2 border-yellow-400/70"
              />
            )}
            <span className="hidden md:block text-sm text-richblack-25">Hi, {user?.firstName}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 py-2 px-4 md:px-5 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-black font-semibold hover:from-yellow-300 hover:to-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
          >
            <IoLogOutOutline fontSize={20} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link to="/signin" className="rounded-full px-4 py-2 text-sm font-semibold text-white hover:text-yellow-400 transition">Sign In</Link>
          <Link to="/signup" className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-yellow-500/20 hover:from-yellow-300 hover:to-yellow-200 transition">Sign Up</Link>
        </div>
      )}
    </div>
  );
};

export default Header;

