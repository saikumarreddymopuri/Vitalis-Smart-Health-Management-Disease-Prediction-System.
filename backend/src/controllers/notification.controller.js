import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const notifs = await Notification.find({ toUser: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(new ApiResponse(200, notifs, "Notifications fetched"));
});

export const markAsSeen = asyncHandler(async (req, res) => {
  const notif = await Notification.findOne({
    _id: req.params.id,
    toUser: req.user._id,
  });
  if (!notif) throw new ApiError(404, "Notification not found");
  notif.seen = true;
  await notif.save();
  res.json(new ApiResponse(200, notif, "Marked as seen"));
});

// --- THIS IS THE NEW FUNCTION ---
export const deleteNotification = asyncHandler(async (req, res) => {
  // We find the notification by its ID and make sure it belongs to the logged-in user
  const notif = await Notification.findOneAndDelete({
    _id: req.params.id,
    toUser: req.user._id,
  });

  if (!notif) {
    throw new ApiError(404, "Notification not found or you don't have permission");
  }

  res.json(new ApiResponse(200, { _id: req.params.id }, "Notification deleted"));
});
// --- END OF NEW FUNCTION ---