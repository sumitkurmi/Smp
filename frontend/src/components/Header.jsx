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
      className="w-full h-16 fixed top-0 z-50 md:h-20 shadow-md flex justify-between items-center pl-16 pr-6 font-semibold bg-richblack-900 text-white transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        <Link to={"/"}>
          <img src={Logo} alt="ChatApp" className="h-12 w-12 rounded-full" />
        </Link>
        <Link to={"/"}>
          <span className="text-xl font-bold text-white hover:text-yellow-400">
            SMP HUB
          </span>
        </Link>
      </div>

      {isLoggedIn ? (
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(setNotificationBox(true))}
            title={`You have ${newMessageRecieved.length} new notifications`}
            className="relative p-2 rounded-full hover:bg-richblack-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
          >
            <MdNotificationsActive fontSize={25} className="text-yellow-400" />
            <span className="absolute -top-1 -right-1 text-xs bg-yellow-400 text-black rounded-full w-4 h-4 flex items-center justify-center">
              {newMessageRecieved.length}
            </span>
          </button>
          {/* Profile avatar */}
          <Link to="/profile" className="flex items-center gap-2">
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="avatar"
                className="hidden md:block w-8 h-8 rounded-full object-cover border-2 border-yellow-400"
              />
            )}
            <span className="hidden md:block">Hi, {user?.firstName}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 py-2 px-5 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
          >
            <IoLogOutOutline fontSize={20} />
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link to="/signin" className="rounded-full px-4 py-2 text-sm font-semibold text-white hover:text-yellow-400">Sign In</Link>
          <Link to="/signup" className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black">Sign Up</Link>
        </div>
      )}
    </div>
  );
};

export default Header;
