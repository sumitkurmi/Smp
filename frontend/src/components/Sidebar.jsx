import { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  if (location.pathname === "/signin" || location.pathname === "/signup") {
    return null;
  }

  const user = useSelector((store) => store.auth);
  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token || user?._id);

  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-[10000] p-2.5 rounded-lg glass-light text-white hover:bg-white/10 shadow-lg transition"
        title="Toggle Menu"
      >
        {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>

      <aside
        className={`fixed top-0 left-0 h-full w-64 glass pt-16 px-6 pb-6 flex flex-col transform transition-transform z-[9999] ${
          isOpen ? "translate-x-0 border-r border-yellow-600/40" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-3">
          <h1 className="text-xl font-extrabold tracking-wide text-gradient-gold flex items-center gap-2">
            SMP HUB
          </h1>
          <p className="text-sm text-richblack-300">
            Collaboration and Interaction for Students at MNNIT
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-1">
          <h2 className="text-lg font-semibold mb-1 text-richblack-25">Pages</h2>
          {isLoggedIn && (
            <Link
              to="/profile"
              className="text-white text-left hover:text-yellow-400 hover:translate-x-1 py-1 transition-all"
            >
              My Profile
            </Link>
          )}
          <Link
            to="/"
            className="hover:text-yellow-400 hover:translate-x-1 transition-all"
          >
            Chat App
          </Link>
          {!isLoggedIn && (
            <>
              <Link
                to="/signin"
                className="hover:text-yellow-400 hover:translate-x-1 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="hover:text-yellow-400 hover:translate-x-1 transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
          <Link
            to="/"
            className="hover:text-yellow-400 hover:translate-x-1 transition-all"
          >
            Home
          </Link>
        </div>

        <div className="mt-auto text-center text-sm text-richblack-400">
          &copy; {new Date().getFullYear()} SMP HUB All rights reserved.
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

