import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const notifs = await Notification.find({ toUser: req.user._id })
    .sort({ createdAt: -1 });
  res.json(new ApiResponse(200, notifs, "Notifications fetched"));
});

export const markAsSeen = asyncHandler(async (req, res) => {
  const notif = await Notification.findOne({ _id: req.params.id, toUser: req.user._id });
  if (!notif) throw new ApiError(404, "Notification not found");
  notif.seen = true;
  await notif.save();
  res.json(new ApiResponse(200, notif, "Marked as seen"));
});
