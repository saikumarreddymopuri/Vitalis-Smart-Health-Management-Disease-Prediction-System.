// src/components/Notifications.jsx
import React, { useState, useEffect, useRef } from "react"; // --- 1. IMPORT useRef ---
import { socket, useSocket } from "../../hooks/useSocket";
import { toast } from "react-hot-toast";
import { HiOutlineBell } from "react-icons/hi"; // --- 2. IMPORT THE BELL ICON ---

// --- 3. THIS IS THE "CLICK OUTSIDE" HOOK ---
// This small hook will detect clicks outside of the dropdown
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // If the click is inside the ref, do nothing
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      // If the click is outside, call the handler (close the dropdown)
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler]);
}
// --- END OF HOOK ---

const Notifications = ({ userId }) => {
  const [notifs, setNotifs] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // --- 4. CREATE A REF FOR THE DROPDOWN ---
  const dropdownRef = useRef(null);
  
  // --- 5. USE THE HOOK ---
  // This will call setShowDropdown(false) if you click outside of dropdownRef
  useClickOutside(dropdownRef, () => setShowDropdown(false));

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
      setNotifs((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification removed!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const unreadCount = notifs.filter((n) => !n.seen).length;

  return (
    // --- 6. ATTACH THE REF to the main div ---
    <div className="relative" ref={dropdownRef}>
      
      {/* --- NEW: Styled Bell Icon --- */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/50 border border-gray-700 text-cyan-300 hover:bg-gray-700/50 transition-all"
      >
        <HiOutlineBell className="w-6 h-6" />
        {/* --- NEW: Neon Pink Badge --- */}
        {unreadCount > 0 && (
          <span 
            className="absolute top-0 right-0 w-3 h-3 bg-fuchsia-500 rounded-full 
                       border-2 border-gray-950 shadow-[0_0_10px_rgba(217,70,239,0.8)]"
          />
        )}
      </button>

      {/* --- NEW: Styled Dropdown --- */}
      {showDropdown && (
        <div 
          className="absolute right-0 mt-3 w-80 bg-gray-900/90 backdrop-blur-lg 
                     border border-blue-500/30 shadow-2xl rounded-xl z-50 
                     max-h-96 overflow-y-auto"
        >
          <div className="p-3 border-b border-blue-500/20">
            <h4 className="font-semibold text-white">Notifications</h4>
          </div>

          {notifs.length === 0 ? (
            <p className="p-4 text-center text-gray-400">
              You're all caught up!
            </p>
          ) : (
            <div>
              {notifs.map((n) => (
                <div
                  key={n._id}
                  className={`p-3 border-b border-blue-500/20 ${
                    !n.seen ? "bg-blue-600/10" : "hover:bg-gray-800/50"
                  } transition-colors`}
                >
                  <p className="font-semibold text-white">{n.title}</p>
                  <p className="text-sm text-gray-300">{n.message}</p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    {!n.seen && (
                      <button
                        onClick={() => markSeen(n._id)}
                        className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteNotification(n._id)}
                      className="text-xs text-red-400 hover:text-red-300 hover:underline font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;