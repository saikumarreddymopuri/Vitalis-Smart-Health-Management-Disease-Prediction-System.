import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Notifications from "./Notifications";
import { useTheme } from "../../hooks/useTheme";

const Header = ({ toggleSidebar, avatarUrl, name, userId, isOpen }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:4000/api/v1/users/logout", {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
        ${isOpen ? "ml-64" : "ml-0"}
        bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border-b border-white/20 dark:border-gray-700 
        shadow-[0_0_15px_rgba(0,255,255,0.2)] dark:shadow-[0_0_15px_rgba(0,255,255,0.1)] 
        flex justify-between items-center px-6 py-4 rounded-b-xl`}
    >
      <button
        className="text-2xl text-cyan-600 dark:text-cyan-300 hover:scale-110 transition-transform"
        onClick={toggleSidebar}
      >
        ☰
      </button>

      {/* Toggle Theme Slider */}
      <label className="inline-flex items-center cursor-pointer ml-4">
        <span className="mr-2 text-sm text-gray-700 dark:text-gray-300">☀️</span>
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={theme === "dark"}
            onChange={toggleTheme}
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-500 transition-colors"></div>
          <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-full dark:bg-gray-300"></div>
        </div>
        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">🌙</span>
      </label>

      <div className="flex items-center space-x-4 ml-auto">
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-10 h-10 rounded-full border border-cyan-400 shadow-md"
        />
        <span className="text-gray-800 dark:text-gray-200 font-semibold hidden sm:block">
          {name}
        </span>

        <Notifications userId={userId} />

        <button
          className="ml-4 px-3 py-1 text-sm rounded border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition duration-200 shadow hover:shadow-red-500/50"
          onClick={() => setShowModal(true)}
        >
          Logout
        </button>
      </div>

      {/* Logout Modal */}
      {showModal && (
  <div className="min-h-screen fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg text-center max-w-sm w-full text-black dark:text-white border border-white/20">
            <p className="text-lg font-semibold mb-4">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
