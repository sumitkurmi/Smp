import { useEffect, useState } from "react";
import { Provider, useSelector } from "react-redux";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Header from "./components/Header";
import NotificationBox from "./components/NotificationBox";
import Sidebar from "./components/Sidebar";
import GroupChatBox from "./components/chatComponents/GroupChatBox";
import Loading from "./components/loading/Loading";

// Pages
import Error from "./pages/Error";
import Home from "./pages/Home";
import MyProfile from "./pages/MyProfile";
import SignIn from "./pages/SignIn";
// Redux Store
import Signup from "./pages/Signup";
import store from "./redux/store";

// Layout Component
const AppLayout = () => {
  const [toastPosition, setToastPosition] = useState("bottom-left");

  const {
    isGroupChatBox,
    isNotificationBox,
    isLoading,
  } = useSelector((store) => store.condition);

  useEffect(() => {
    const updatePosition = () => {
      setToastPosition(window.innerWidth >= 600 ? "bottom-left" : "top-left");
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col text-white overflow-hidden bg-richblack-900">
      {/* Ambient background blobs */}
      <div className="ambient-blob w-96 h-96 bg-yellow-500 -top-24 -left-24" />
      <div className="ambient-blob w-[28rem] h-[28rem] bg-blue-600 top-1/3 -right-32" />
      <div className="ambient-blob w-80 h-80 bg-purple-600 bottom-0 left-1/3" />

      {/* Toast Notifications */}
      <ToastContainer
        position={toastPosition}
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        limit={3}
        toastStyle={{
          border: "1px solid #F7C94855",
          textTransform: "capitalize",
          background: "rgba(22,29,41,0.95)",
          backdropFilter: "blur(12px)",
          borderRadius: "12px",
        }}
      />

      {/* Header */}
      <Header />
      <div className="h-16 md:h-20" />

      {/* Main Content */}
      <main className="relative z-10 flex-1 min-h-[85vh] p-2 sm:p-4">
        <Outlet />
        {/* Overlays */}
        {isGroupChatBox && <GroupChatBox />}
        {isNotificationBox && <NotificationBox />}
      </main>

      {/* Loading Overlay */}
      {isLoading && <Loading />}

      {/* Sidebar */}
      <Sidebar />
    </div>
  );
};

// Define Routes
const routers = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Home /> },
      { path: "profile", element: <MyProfile /> },
      { path: "signup", element: <Signup /> },
      { path: "signin", element: <SignIn /> },
      { path: "*", element: <Error /> },
    ],
  },
]);

// App Entry
function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={routers} />
    </Provider>
  );
}

export default App;

