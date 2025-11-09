// src/components/Notifications.jsx
import React, { useState, useEffect } from "react";
import { socket, useSocket } from "../../hooks/useSocket";
import { toast } from "react-hot-toast"; // --- Import toast for feedback ---

const Notifications = ({ userId }) => {
  const [notifs, setNotifs] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useSocket(userId, (notif) => {
    setNotifs((prev) => [notif, ...prev]);
  });

  useEffect(() => {
    fetch("http://localhost:4000/api/notifications", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setNotifs(d.data || []));
  }, []);

  const markSeen = async (id) => {
    await fetch(`http://localhost:4000/api/notifications/${id}/seen`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: "include",
    });

    setNotifs((prev) =>
      prev.map((n) => (n._id === id ? { ...n, seen: true } : n))
    );
  };

  // --- THIS IS THE NEW DELETE FUNCTION ---
  const handleDeleteNotification = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete notification");
      }

      // Remove from state instantly
      setNotifs((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification removed!");
    } catch (err) {
      toast.error(err.message);
    }
  };
  // --- END OF NEW FUNCTION ---

  return (
    <div className="relative">
      {/* 🔔 Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative text-lg"
      >
        🔔
        {notifs.some((n) => !n.seen) && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            !
          </span>
        )}
      </button>

      {/* 📨 Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg rounded z-50 max-h-96 overflow-y-auto">
          {notifs.length === 0 && (
            <p className="p-3 text-center text-gray-500 dark:text-gray-400">
              No notifications
            </p>
          )}

          {notifs.map((n) => (
            <div
              key={n._id}
              className={`p-3 border-b border-gray-200 dark:border-gray-600 ${
                !n.seen ? "bg-gray-100 dark:bg-gray-700" : ""
              }`}
            >
              <p className="font-semibold text-black dark:text-white">{n.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{n.message}</p>
              
              {/* --- NEW BUTTON CONTAINER --- */}
              <div className="flex items-center gap-4 mt-1">
                {!n.seen && (
                  <button
                    onClick={() => markSeen(n._id)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Mark as read
                  </button>
                )}
                
                {/* --- THIS IS THE NEW DELETE BUTTON --- */}
                <button
                  onClick={() => handleDeleteNotification(n._id)}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  Remove
                </button>
                {/* --- END OF NEW BUTTON --- */}
              </div>
              {/* --- END OF BUTTON CONTAINER --- */}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;