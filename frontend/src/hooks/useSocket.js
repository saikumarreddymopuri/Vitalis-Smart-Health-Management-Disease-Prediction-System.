// src/hooks/useSocket.js
import { useEffect } from "react";
import { io } from "socket.io-client";

export const socket = io("http://localhost:4000", {
  withCredentials: true,
});

export const useSocket = (userId, onNotification) => {
  useEffect(() => {
    if (!userId) return;

    // ✅ Join personal room for this user
    socket.emit("join", userId);
    console.log("🔗 Joined socket room:", userId);

    // ✅ Listen for notifications
    socket.on("notification", onNotification);

    return () => {
      socket.off("notification", onNotification); // cleanup
    };
  }, [userId, onNotification]);
};
