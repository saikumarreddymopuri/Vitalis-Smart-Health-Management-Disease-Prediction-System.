import React, { useState } from "react";
import API from "../../utils/api";

import ReactDOM from "react-dom"; // --- 1. IMPORT REACTDOM ---
import { useNavigate } from "react-router-dom";
import Notifications from "./Notifications";
// import { useTheme } from "../../hooks/useTheme";
import { HiMenuAlt2, HiSun, HiMoon } from "react-icons/hi";
import { TbHexagonLetterV } from "react-icons/tb";

const Header = ({ toggleSidebar, avatarUrl, name, userId, isOpen }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  // const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
        const token = localStorage.getItem("token");
        console.log("TOKEN BEFORE LOGOUT:", token);

        await API.post(
          "/api/v1/users/logout",
          {},
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // --- 2. WE CREATE THE MODAL AS A SEPARATE COMPONENT ---
  const LogoutModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-full max-w-sm text-white border border-blue-500/30">
        <p className="text-lg font-semibold text-center mb-6">
          Are you sure you want to logout?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-medium transition-all
                       shadow-[0_0_15px_rgba(239,68,68,0.6)] hover:shadow-[0_0_25px_rgba(239,68,68,0.9)]"
          >
            Yes, Logout
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="px-6 py-2 rounded-lg bg-gray-700/50 border border-gray-600 hover:bg-gray-700/80 font-medium transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
          ${isOpen ? "ml-64" : "ml-0"}
          bg-gray-950/80 backdrop-blur-lg border-b border-blue-500/30
          shadow-[0_0_20px_rgba(59,130,246,0.2)]
          flex justify-between items-center px-6 py-3`}
      >
        <div className="flex items-center gap-3">
          <button
            className="text-3xl text-cyan-300 hover:text-white transition-colors"
            onClick={toggleSidebar}
          >
            <HiMenuAlt2 />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-600/20 rounded-full border border-blue-500/50 hidden sm:block">
              <TbHexagonLetterV className="text-xl text-cyan-300" />
            </div>
            <h2 className="text-lg font-bold text-white hidden sm:block">VITALIS</h2>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          
          {/* <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/50 border border-gray-700 text-yellow-400 hover:bg-gray-700/50 transition-all"
          >
            {theme === "dark" ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
          </button> */}

          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-10 h-10 rounded-full border-2 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]"
          />
          <span className="text-gray-200 font-semibold hidden sm:block">
            {name}
          </span>

          <Notifications userId={userId} />

          <button
            className="ml-2 px-4 py-2 text-sm rounded-lg border border-red-500/70 bg-red-600/30 text-red-300 
                       font-medium hover:bg-red-600/60 hover:text-white transition duration-200 
                       shadow-[0_0_10px_rgba(239,68,68,0.4)]"
            onClick={() => setShowModal(true)}
          >
            Logout
          </button>
        </div>
      </header>

      {/* --- 3. WE RENDER THE MODAL USING THE PORTAL --- */}
      {showModal && ReactDOM.createPortal(
        <LogoutModal />,
        document.getElementById("modal-root")
      )}
    </>
  );
};

export default Header;