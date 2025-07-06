// src/components/Notifications.jsx
import React, { useState, useEffect } from "react";
import { socket, useSocket } from "../../hooks/useSocket"; // Adjust path if needed

const Notifications = ({ userId }) => {
  const [notifs, setNotifs] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ Listen for real-time updates
  useSocket(userId, (notif) => {
    setNotifs((prev) => [notif, ...prev]);
  });

  // ✅ Initial fetch
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

  return (
    <div className="relative">
      {/* 🔔 Notification Bell */}
      <button onClick={() => setShowDropdown(!showDropdown)} className="relative">
        🔔
        {notifs.some((n) => !n.seen) && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            !
          </span>
        )}
      </button>

      {/* ⬇️ Notification Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white border shadow-lg rounded z-50 max-h-96 overflow-y-auto">
          {notifs.length === 0 && (
            <p className="p-2 text-center text-gray-500">No notifications</p>
          )}

          {notifs.map((n) => (
            <div key={n._id} className={`p-3 border-b ${!n.seen ? "bg-gray-100" : ""}`}>
              <p className="font-semibold">{n.title}</p>
              <p className="text-sm">{n.message}</p>
              {!n.seen && (
                <button
                  onClick={() => markSeen(n._id)}
                  className="text-xs text-blue-600 mt-1"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
