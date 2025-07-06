// src/utils/notify.js
import { Notification } from "../models/notification.model.js";

export const notifyUser = async (userId, role, title, message, link = null) => {
  if (!userId) {
    console.error("❌ notifyUser called without userId");
    return;
  }

  // 1. Save notification to DB
  const notif = await Notification.create({
    toUser: userId,
    role,
    title,
    message,
    link,
  });

  // 2. Emit to socket room
  if (global.io) {
    global.io.to(userId.toString()).emit("notification", {
      _id: notif._id,
      title,
      message,
      link,
      seen: notif.seen,
      createdAt: notif.createdAt,
    });
  } else {
    console.warn("⚠️ io not available globally");
  }
};
