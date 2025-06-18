import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ toggleSidebar, avatarUrl, name }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:4000/api/v1/users/logout", {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("user");
      navigate("/"); // redirect to login
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center md:ml-64">
      <button
        className="text-2xl text-blue-700 md:hidden"
        onClick={toggleSidebar}
      >
        ☰
      </button>

      <div className="flex items-center space-x-4 ml-auto">
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-10 h-10 rounded-full border"
        />
        <span className="text-gray-700 font-semibold hidden sm:block">
          {name}
        </span>

        <button
          className="ml-4 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          onClick={() => setShowModal(true)}
        >
          Logout
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md text-center max-w-sm w-full">
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
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
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
