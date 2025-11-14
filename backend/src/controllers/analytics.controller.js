import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import Hospital from "../models/hospital.model.js";
import { Booking } from "../models/bedbooking.model.js";
import { AmbulanceBooking } from "../models/ambulanceBooking.model.js";
import Symptom from "../models/symptom.model.js";
import { Bed } from "../models/bed.model.js";
import { Ambulance } from "../models/ambulance.model.js";
import mongoose from "mongoose";

// --- MAIN STATS & CHARTS ---
// This one function gets all the data for the cards and charts
export const getMainStats = asyncHandler(async (req, res) => {
  // --- 1. "Action Required" Cards (Pending Counts) ---
  const pendingHospitalsPromise = Hospital.countDocuments({ is_verified: false });
  const pendingBedBookingsPromise = Booking.countDocuments({ status: "pending" });
  const pendingAmbulanceBookingsPromise = AmbulanceBooking.countDocuments({
    status: "pending",
  });

  // --- 2. "Key Stats" Cards (Total Counts) ---
  const totalUsersPromise = User.countDocuments({ role: "User" });
  const totalOperatorsPromise = User.countDocuments({ role: "Operator" });
  const totalHospitalsPromise = Hospital.countDocuments({ is_verified: true });
  const totalBedBookingsPromise = Booking.countDocuments({
    status: { $in: ["confirmed", "rejected", "cancelled"] },
  });
  const totalAmbulanceBookingsPromise = AmbulanceBooking.countDocuments({
    status: { $in: ["confirmed", "rejected", "cancelled"] },
  });

  // --- 3. "Smart Charts" Data ---
  
  // Top 5 Diseases (Bar Chart)
  const topDiseasesPromise = Symptom.aggregate([
    { $group: { _id: "$predictedDisease", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $project: { disease: "$_id", count: 1, _id: 0 } },
  ]);

  // --- 4. "Availability" Cards (Your New Feature) ---
  
  // Bed Availability
  const bedAvailabilityPromise = Bed.aggregate([
    { $match: { is_available: true } },
    { $group: { _id: "$bed_type", totalAvailable: { $sum: "$availableBeds" } } },
    { $project: { type: "$_id", count: "$totalAvailable", _id: 0 } }
  ]);
  
  // Ambulance Availability
  const ambulanceAvailabilityPromise = Ambulance.aggregate([
    { $match: { is_available: true } },
    { $group: { _id: "$ambulance_type", count: { $sum: 1 } } },
    { $project: { type: "$_id", count: 1, _id: 0 } }
  ]);
  
  // Top 5 Hospital Trends (Line Chart)
  const hospitalTrendsPromise = (async () => {
    // a. Find top 5 hospitals
    const bedBookings = await Booking.aggregate([
      { $match: { status: { $in: ["confirmed", "pending"] } } },
      { $group: { _id: "$hospital", count: { $sum: 1 } } },
    ]);
    const ambBookings = await AmbulanceBooking.aggregate([
      { $match: { status: { $in: ["confirmed", "pending"] } } },
      { $group: { _id: "$hospital", count: { $sum: 1 } } },
    ]);
    const hospitalCounts = {};
    [...bedBookings, ...ambBookings].forEach(booking => {
      hospitalCounts[booking._id] = (hospitalCounts[booking._id] || 0) + booking.count;
    });
    const top5HospitalIds = Object.entries(hospitalCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => new mongoose.Types.ObjectId(id));
      
    // b. Get booking trends for *only* these top 5 hospitals
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const bedTrends = Booking.aggregate([
      { $match: { hospital: { $in: top5HospitalIds }, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { hospital: "$hospital", date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } }, count: { $sum: 1 } } },
    ]);
    const ambTrends = AmbulanceBooking.aggregate([
      { $match: { hospital: { $in: top5HospitalIds }, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { hospital: "$hospital", date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } }, count: { $sum: 1 } } },
    ]);
    
    // c. Populate hospital names
    const hospitals = await Hospital.find({ _id: { $in: top5HospitalIds } }).select("name");
    const hospitalNameMap = hospitals.reduce((acc, hosp) => {
      acc[hosp._id] = hosp.name;
      return acc;
    }, {});

    return { trends: [...(await bedTrends), ...(await ambTrends)], names: hospitalNameMap };
  })();


  // --- Run all queries in parallel ---
  const [
    pendingHosp,
    pendingBed,
    pendingAmb,
    users,
    operators,
    hospitals,
    bedBookings,
    ambBookings,
    topDiseases,
    bedAvailability,
    ambulanceAvailability,
    hospitalTrends,
  ] = await Promise.all([
    pendingHospitalsPromise,
    pendingBedBookingsPromise,
    pendingAmbulanceBookingsPromise,
    totalUsersPromise,
    totalOperatorsPromise,
    totalHospitalsPromise,
    totalBedBookingsPromise,
    totalAmbulanceBookingsPromise,
    topDiseasesPromise,
    bedAvailabilityPromise,
    ambulanceAvailabilityPromise,
    hospitalTrendsPromise,
  ]);

  // --- Format the final JSON response ---
  const response = {
    actionCards: {
      pendingHospitals: pendingHosp,
      pendingBookings: pendingBed + pendingAmb,
    },
    keyStats: {
      totalUsers: users,
      totalOperators: operators,
      totalHospitals: hospitals,
      totalBookings: bedBookings + ambBookings,
    },
    charts: {
      topDiseases,
      hospitalTrends,
    },
    availability: {
      beds: bedAvailability,
      ambulances: ambulanceAvailability,
    }
  };

  return res.status(200).json(new ApiResponse(200, response, "Analytics data fetched"));
});

// --- LIVE ACTIVITY FEED ---
// This function gets the data for the live feed on the right
export const getLiveFeed = asyncHandler(async (req, res) => {
  const limit = 5;

  // 1. Newest Signups (Users & Operators)
  const newUsers = User.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("fullName createdAt role");

  // 2. Newest Predictions
  const newPredictions = Symptom.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("predictedDisease createdAt user")
    .populate("user", "fullName");

  // 3. Newest Bed Booking Requests (Pending)
  const newBedRequests = Booking.find({ status: "pending" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("hospital bed_type createdAt user")
    .populate("user", "fullName")
    .populate("hospital", "name");

  // 4. Newest Ambulance Booking Requests (Pending)
  const newAmbRequests = AmbulanceBooking.find({ status: "pending" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("hospital pickup_location createdAt user")
    .populate("user", "fullName")
    .populate("hospital", "name");
    
  // 5. Newest Confirmed/Rejected Bookings (Bed)
  const updatedBeds = Booking.find({ status: { $in: ["confirmed", "rejected"] } })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select("hospital status bed_type updatedAt user")
    .populate("user", "fullName")
    .populate("hospital", "name");
    
  // 6. Newest Confirmed/Rejected Bookings (Ambulance)
  const updatedAmbulances = AmbulanceBooking.find({ status: { $in: ["confirmed", "rejected"] } })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select("hospital status updatedAt user")
    .populate("user", "fullName")
    .populate("hospital", "name");

  // Run all feed queries in parallel
  const [
    users,
    predictions,
    bedRequests,
    ambRequests,
    updatedBedBookings,
    updatedAmbBookings
  ] = await Promise.all([
    newUsers,
    newPredictions,
    newBedRequests,
    newAmbRequests,
    updatedBeds,
    updatedAmbulances
  ]);
  
  // --- Combine and Format the Feed ---
  const feed = [
    ...users.map(u => ({ type: "signup", data: u, timestamp: u.createdAt })),
    ...predictions.map(p => ({ type: "prediction", data: p, timestamp: p.createdAt })),
    ...bedRequests.map(b => ({ type: "bed_request", data: b, timestamp: b.createdAt })),
    ...ambRequests.map(a => ({ type: "amb_request", data: a, timestamp: a.createdAt })),
    ...updatedBedBookings.map(b => ({ type: "bed_update", data: b, timestamp: b.updatedAt })),
    ...updatedAmbBookings.map(a => ({ type: "amb_update", data: a, timestamp: a.updatedAt }))
  ];
  
  // Sort by timestamp and take the 10 newest
  const sortedFeed = feed
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  return res.status(200).json(new ApiResponse(200, sortedFeed, "Live feed fetched"));
});