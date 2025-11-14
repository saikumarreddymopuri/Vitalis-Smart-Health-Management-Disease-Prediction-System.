import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import Footer from "../components/layout/Footer.jsx";
// import RoleDoughnutChart from "../components/Admin/Charts/RoleDoughnutChart.jsx";
import DiseaseBarChart from "../components/Admin/Charts/DiseaseBarChart.jsx";
import HospitalLineChart from "../components/Admin/Charts/HospitalLineChart.jsx";
import BedAvailability from "../components/Admin/Charts/BedAvailability.jsx";
import AmbulanceAvailability from "../components/Admin/Charts/AmbulanceAvailability.jsx";
// --- NEW IMPORT ---
import UserManagementPanel from "../components/Admin/UserManagementPanel.jsx";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { toast } from "react-hot-toast";
import {
  HiUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineBadgeCheck,
  HiPencil,
  HiOutlineUsers,
  HiPencilAlt,
  HiOutlineX,
  HiOutlineTrash,
  HiOutlineExclamation,
  HiCheck,
  HiOutlineArrowLeft,
  HiOutlineClock,
  HiOutlineOfficeBuilding,
  HiOutlineBeaker,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineArchive,
  HiOutlineUserCircle,
  HiOutlineCollection,
  HiOutlineExclamationCircle,
  HiOutlineLightningBolt,
  HiOutlineChartPie,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { FaBed, FaAmbulance } from "react-icons/fa";
import ReactDOM from "react-dom";

const AdminDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  // const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("");
  const [pendingHospitals, setPendingHospitals] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch pending hospitals
  useEffect(() => {
    const fetchPendingHospitals = async () => {
      if (activeTab === "pending") {
        try {
          const res = await fetch(
            "http://localhost:4000/api/hospitals/pending",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          setPendingHospitals(data.data || []);
          console.log("📥 Pending hospitals:", data.data);
        } catch (err) {
          console.error("❌ Error fetching pending:", err);
        }
      }
    };

    fetchPendingHospitals();
  }, [activeTab, token]); // --- Added token to dependency array ---

  const handleApprove = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/hospitals/${id}/verify`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setPendingHospitals((prev) => prev.filter((h) => h._id !== id));
        alert("✅ Approved successfully"); // --- We will change this later ---
      }
    } catch (err) {
      console.error("❌ Error approving:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/api/hospitals/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setPendingHospitals((prev) => prev.filter((h) => h._id !== id));
        alert("❌ Rejected & removed"); // --- We will change this later ---
      }
    } catch (err) {
      console.error("❌ Error rejecting:", err);
    }
  };


  // editable admin profile

  const { user, setUser } = useContext(UserContext);

// State for the editable profile
const [isEditing, setIsEditing] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [profileData, setProfileData] = useState({
  // We set the initial state from the user context
  fullName: user?.fullName || "",
  phone: user?.phone || "",
});

// Function to handle input changes
const handleProfileChange = (e) => {
  setProfileData({ ...profileData, [e.target.name]: e.target.value });
};

// Function to handle saving
const handleProfileSave = async () => {
  setIsLoading(true);
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:4000/api/v1/users/update-me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to update profile");
    }

    // 1. Update the global context (which updates the Header)
    setUser(data.data);
    // 2. localStorage is updated by UserContext automatically

    toast.success("Profile updated successfully!");
    setIsEditing(false);
  } catch (err) {
    toast.error(err.message);
  } finally {
    setIsLoading(false);
  }
};

// Function to cancel editing
const handleCancelEdit = () => {
  setIsEditing(false);
  // Reset any changes back to the original user data
  setProfileData({ fullName: user.fullName, phone: user.phone });
};


//approved hospital history
const [hospitalHistory, setHospitalHistory] = useState([]);

useEffect(() => {
  const fetchHospitalHistory = async () => {
    if (activeTab === "history") {
      try {
        const res = await fetch(
          "http://localhost:4000/api/hospitals/admin/history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setHospitalHistory(data.data || []);
        } else {
          toast.error("Failed to fetch hospital history");
        }
      } catch (err) {
        console.error("❌ Error fetching hospital history:", err);
        toast.error("An error occurred while fetching history");
      }
    }
  };

  fetchHospitalHistory();
}, [activeTab, token]);



// analytics data

  const [statsData, setStatsData] = useState(null);
  const [feedData, setFeedData] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
  const fetchAnalytics = async () => {
    // Only run this if the analytics tab is open
    if (activeTab === "analytics") {
      setAnalyticsLoading(true);
      try {
        // Fetch main stats and feed in parallel
        const [statsRes, feedRes] = await Promise.all([
          fetch("http://localhost:4000/api/v1/analytics/main", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:4000/api/v1/analytics/feed", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const stats = await statsRes.json();
        const feed = await feedRes.json();

        // --- THIS IS THE FIX ---
        // We check for 'stats.data' instead of 'stats.success'
        if (stats.data) {
          setStatsData(stats.data);
        } else {
          toast.error("Failed to load analytics stats");
        }

        // We check for 'feed.data' instead of 'feed.success'
        if (feed.data) {
          setFeedData(feed.data || []);
        } else {
          toast.error("Failed to load live feed");
        }
        // --- END OF FIX ---

      } catch (err) {
        console.error(err);
        toast.error("Analytics data failed to load.");
      } finally {
        // No matter what, stop loading
        setAnalyticsLoading(false);
      }
    }
  };

  fetchAnalytics();
}, [activeTab, token]);






  return (


    <div className="min-h-screen bg-white pt-20 pb-16 text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <Header
        toggleSidebar={() => setIsOpen(!isOpen)}
        avatarUrl={user.avatar}
        name={user.fullName}
        isOpen={isOpen}
      />
      <Sidebar
        isOpen={isOpen}
        toggleSidebar={() => setIsOpen(!isOpen)}
        setActiveTab={setActiveTab}
        role={user.role}
      />

      <main
        className={`p-6 flex-grow transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-0"
        }`}
      >
        {activeTab === "" && (
  <div className="flex flex-col items-center justify-center h-[70vh] text-center">
    
    {/* --- NEW: Glowing Avatar (matches the other dashboards) --- */}
    <img
      src={user.avatar}
      alt="Admin Avatar"
      className="w-32 h-32 rounded-full border-4 border-fuchsia-500 
                 shadow-[0_0_25px_rgba(217,70,239,0.7),_0_0_10px_rgba(217,70,239,0.5)] mb-6"
    />
    
    {/* --- NEW: Styled Title with Cyber Pink/Blue Gradient --- */}
    <h1 className="flex items-center gap-3 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 mb-2">
      <HiOutlineShieldCheck /> Welcome Admin, {user.fullName}!
    </h1>
    
    {/* --- NEW: Styled Subtitle --- */}
    <p className="text-gray-400 text-lg">
      Manage and monitor the system effectively.
    </p>
    <p className="text-gray-500 text-md mt-4">
      Select an option from the sidebar to get started.
    </p>
  </div>
)}

        {activeTab === "profile" && (
  <div className="bg-gray-900/60 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto border border-blue-500/30">
    
    {/* Profile Header */}
    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-8">
      {/* Avatar with Pink Glow */}
      <img
        src={user.avatar}
        alt="User Avatar"
        className="w-32 h-32 rounded-full border-4 border-fuchsia-500 
                   shadow-[0_0_25px_rgba(217,70,239,0.7)]"
      />
      <div className="text-center sm:text-left">
        {/* Gradient Title */}
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 mb-2">
          Admin Profile
        </h2>
        {/* Name (updates instantly from context) */}
        <p className="text-2xl font-semibold text-white">{user.fullName}</p>
        <p className="text-md text-gray-400">{user.email}</p>
      </div>
      
      {/* Edit/Save/Cancel Buttons */}
      <div className="sm:ml-auto flex-shrink-0">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-fuchsia-500/70 bg-fuchsia-600/30 text-fuchsia-300 
                       font-medium hover:bg-fuchsia-600/60 hover:text-white transition duration-200 
                       shadow-[0_0_10px_rgba(217,70,239,0.4)]"
          >
            <HiPencil />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleProfileSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-green-600 text-white 
                         font-medium hover:bg-green-500 transition duration-200 
                         shadow-[0_0_15px_rgba(34,197,94,0.6)] disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isLoading}
              className="px-4 py-2 text-sm rounded-lg bg-gray-700/50 border border-gray-600 text-gray-300
                         font-medium hover:bg-gray-700/80 transition duration-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Profile Details Section */}
    <div className="space-y-6">
      
      {/* Full Name */}
      <div className="flex items-center gap-4">
        <HiUser className="w-6 h-6 text-cyan-400 flex-shrink-0" />
        <div className="w-full">
          <label className="text-sm font-medium text-gray-400">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              name="fullName"
              value={profileData.fullName}
              onChange={handleProfileChange}
              className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-lg text-white">{user.fullName}</p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-4">
        <HiOutlinePhone className="w-6 h-6 text-cyan-400 flex-shrink-0" />
        <div className="w-full">
          <label className="text-sm font-medium text-gray-400">Phone</label>
          {isEditing ? (
            <input
              type="text"
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-lg text-white">{user.phone}</p>
          )}
        </div>
      </div>
      
      {/* Email (Not Editable) */}
      <div className="flex items-center gap-4">
        <HiOutlineMail className="w-6 h-6 text-cyan-400 flex-shrink-0" />
        <div className="w-full">
          <label className="text-sm font-medium text-gray-400">Email (Cannot be changed)</label>
          <p className="text-lg text-gray-400">{user.email}</p>
        </div>
      </div>

      {/* Role (Not Editable) */}
      <div className="flex items-center gap-4">
        <HiOutlineBadgeCheck className="w-6 h-6 text-cyan-400 flex-shrink-0" />
        <div className="w-full">
          <label className="text-sm font-medium text-gray-400">Role</label>
          <span className="capitalize px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full border border-blue-700">
            {user.role}
          </span>
        </div>
      </div>
      
    </div>
  </div>
)}

        {activeTab === "pending" && (
  // --- NEW: Glassmorphic main card ---
  <div className="bg-gray-900/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-blue-500/30">
    
    {/* --- NEW: Gradient Title with Icon --- */}
    <div className="flex items-center justify-center gap-3 mb-8">
      <HiOutlineClock className="w-8 h-8 text-cyan-400" />
      <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
        Pending Hospital Requests
      </h2>
    </div>

    {pendingHospitals.length === 0 ? (
      <p className="text-center text-gray-400 py-8">
        No pending requests 🎉
      </p>
    ) : (
      // --- NEW: Replaced <ul> with a list of cards ---
      <div className="space-y-4">
        {pendingHospitals.map((hospital) => (
          // --- NEW: Glassmorphic Request Card ---
          <div
            key={hospital._id}
            className="bg-gray-900/70 p-5 rounded-xl border border-blue-500/30 shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Hospital Info */}
              <div>
                <p className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                  <HiOutlineOfficeBuilding /> Hospital
                </p>
                <p className="text-lg font-semibold text-white">
                  {hospital.name}
                </p>
                <p className="text-sm text-gray-400">{hospital.city}</p>
              </div>
              
              {/* Contact Info */}
              <div>
                <p className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                  <HiOutlinePhone /> Contact
                </p>
                <p className="text-lg text-white">
                  {hospital.contact_number}
                </p>
              </div>

              {/* Specialization Info */}
              <div>
                <p className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                  <HiOutlineBeaker /> Specialization
                </p>
                <p className="text-sm text-gray-300 capitalize">
                  {Array.isArray(hospital.specialization_offered)
                    ? hospital.specialization_offered.join(", ")
                    : hospital.specialization_offered}
                </p>
              </div>
            </div>

            {/* --- NEW: Styled Action Buttons --- */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-blue-500/30">
              <button
                onClick={() => handleApprove(hospital._id)}
                className="flex-1 py-2 px-4 rounded-lg bg-green-600 text-white font-semibold transition-all
                           shadow-[0_0_15px_rgba(34,197,94,0.6)] hover:shadow-[0_0_25px_rgba(34,197,94,0.9)]
                           hover:bg-green-500"
              >
                <HiOutlineCheckCircle className="inline w-5 h-5 mr-2" />
                Approve
              </button>
              <button
                onClick={() => handleReject(hospital._id)}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600 text-white font-semibold transition-all
                           shadow-[0_0_15px_rgba(239,68,68,0.6)] hover:shadow-[0_0_25px_rgba(239,68,68,0.9)]
                           hover:bg-red-500"
              >
                <HiOutlineXCircle className="inline w-5 h-5 mr-2" />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

        {/* --- NEW USER MANAGEMENT SECTIONS --- */}
        {activeTab === "manageCustomers" && (
          <UserManagementPanel
            roleToManage="User"
            token={token}
            key="customers"
          />
        )}

        {activeTab === "manageOperators" && (
          <UserManagementPanel
            roleToManage="Operator"
            token={token}
            key="operators"
          />
        )}

         
        {activeTab === "analytics" && (
  // --- Main container (h-full and flex-col for scrolling) ---
  <div className="bg-gray-900/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-blue-500/30 h-full flex flex-col">
    
    {/* --- Main Title (flex-shrink-0) --- */}
    <div className="flex items-center justify-center gap-3 mb-8 flex-shrink-0">
      <HiOutlineChartPie className="w-8 h-8 text-cyan-400" />
      <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
        VITALIS Command Center
      </h2>
    </div>

    {analyticsLoading ? (
      <div className="text-center text-cyan-400 py-20">Loading Analytics...</div>
    ) : !statsData ? (
      <div className="text-center text-red-400 py-20">Failed to load data.</div>
    ) : (
      
      // --- 1. MAIN 70/30 GRID (flex-grow and min-h-0) ---
      <div className="grid grid-cols-10 gap-6 flex-grow min-h-0">
        
        {/* --- 2. LEFT COLUMN (overflow-y-auto) --- */}
        <div className="col-span-10 lg:col-span-7 flex flex-col space-y-6 overflow-y-auto pr-2">
          
          {/* --- "Action Required" Row (Unchanged) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-900/40 border border-red-500/50 p-5 rounded-2xl shadow-2xl animate-pulse">
              <div className="flex items-center gap-3">
                <HiOutlineExclamationCircle className="w-8 h-8 text-red-400" />
                <span className="text-lg font-semibold text-red-300">Action Required</span>
              </div>
              <p className="text-5xl font-bold text-white mt-3">
                {statsData.actionCards.pendingHospitals}
              </p>
              <p className="text-red-300">Pending Hospital Approvals</p>
            </div>
            <div className="bg-red-900/40 border border-red-500/50 p-5 rounded-2xl shadow-2xl animate-pulse">
              <div className="flex items-center gap-3">
                <HiOutlineExclamationCircle className="w-8 h-8 text-red-400" />
                <span className="text-lg font-semibold text-red-300">Action Required</span>
              </div>
              <p className="text-5xl font-bold text-white mt-3">
                {statsData.actionCards.pendingBookings}
              </p>
              <p className="text-red-300">Pending Bed & Ambulance Bookings</p>
            </div>
          </div>

          {/* --- "Key Stats" Row (NEW: STYLED & FLASHING) --- */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Users */}
            <div className="bg-blue-900/40 border border-blue-500/50 p-5 rounded-2xl shadow-2xl animate-pulse">
              <HiOutlineUsers className="w-8 h-8 text-blue-300" />
              <p className="text-4xl font-bold text-white mt-2">{statsData.keyStats.totalUsers}</p>
              <p className="text-blue-300">Total Users</p>
            </div>
            {/* Total Operators */}
            <div className="bg-blue-900/40 border border-blue-500/50 p-5 rounded-2xl shadow-2xl animate-pulse">
              <HiOutlineUserGroup className="w-8 h-8 text-blue-300" />
              <p className="text-4xl font-bold text-white mt-2">{statsData.keyStats.totalOperators}</p>
              <p className="text-blue-300">Total Operators</p>
            </div>
            {/* Total Hospitals */}
            <div className="bg-green-900/40 border border-green-500/50 p-5 rounded-2xl shadow-2xl animate-pulse">
              <HiOutlineOfficeBuilding className="w-8 h-8 text-green-300" />
              <p className="text-4xl font-bold text-white mt-2">{statsData.keyStats.totalHospitals}</p>
              <p className="text-green-300">Total Hospitals</p>
            </div>
            {/* Total Bookings */}
            <div className="bg-fuchsia-900/40 border border-fuchsia-500/50 p-5 rounded-2xl shadow-2xl animate-pulse">
              <HiOutlineCollection className="w-8 h-8 text-fuchsia-300" />
              <p className="text-4xl font-bold text-white mt-2">{statsData.keyStats.totalBookings}</p>
              <p className="text-fuchsia-300">Total Bookings</p>
            </div>
          </div>
          
          {/* --- "Smart Charts" Row 1 (NEW: STYLED & FLASHING) --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bed Availability */}
            <div className="bg-blue-900/40 border border-blue-500/50 p-5 rounded-2xl h-80 animate-pulse">
              <BedAvailability data={statsData.availability.beds} />
            </div>
            {/* Ambulance Availability */}
            <div className="bg-fuchsia-900/40 border border-fuchsia-500/50 p-5 rounded-2xl h-80 animate-pulse">
              <AmbulanceAvailability data={statsData.availability.ambulances} />
            </div>
          </div>
          
          {/* --- "Smart Charts" Row 2 --- */}
          <div className="bg-gray-900/70 border border-blue-500/30 p-5 rounded-2xl h-80">
            <DiseaseBarChart chartData={statsData.charts.topDiseases} />
          </div>

          {/* --- "Smart Charts" Row 3 (Line Chart) --- */}
          <div className="bg-gray-900/70 border border-blue-500/30 p-5 rounded-2xl h-96">
            <HospitalLineChart chartData={statsData.charts.hospitalTrends} />
          </div>
        </div>

        {/* --- 4. RIGHT COLUMN (Live Feed) --- */}
        <div className="col-span-10 lg:col-span-3 flex flex-col space-y-4 h-full">
          <h3 className="text-2xl font-semibold text-cyan-400 flex items-center gap-2 flex-shrink-0">
            <HiOutlineLightningBolt />
            Live Activity Feed
          </h3>
          
          <div className="bg-gray-900/70 border border-blue-500/30 p-4 rounded-2xl flex-grow overflow-y-auto space-y-4">
            {feedData.length === 0 ? (
              <p className="text-gray-400 text-center py-10">No recent activity.</p>
            ) : (
              feedData.map((item, index) => (
                <div key={index} className="flex gap-3 border-b border-gray-800/50 pb-3 last:border-b-0">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-700/50 text-cyan-300">
                    {item.type === 'signup' && <HiUser />}
                    {item.type === 'prediction' && <HiOutlineBeaker />}
                    {item.type === 'bed_request' && <FaBed />}
                    {item.type === 'amb_request' && <FaAmbulance />}
                    {item.type === 'bed_update' && (item.data.status === 'confirmed' ? <HiCheck /> : <HiOutlineX />)}
                    {/* --- THIS IS THE FIX for the empty items --- */}
                    {item.type === 'amb_update' && (item.data.status === 'confirmed' ? <HiCheck /> : <HiOutlineX />)}
                  </div>
                  <div className="text-sm">
                    {item.type === 'signup' && (
                      <p className="text-white">New {item.data.role} Signup: <span className="font-bold">{item.data.fullName}</span></p>
                    )}
                    {item.type === 'prediction' && (
                      <p className="text-white"><span className="font-bold">{item.data.user?.fullName || "User"}</span> predicted <span className="text-green-400 font-medium">{item.data.predictedDisease}</span></p>
                    )}
                    {item.type === 'bed_request' && (
                      <p className="text-white"><span className="font-bold">{item.data.user?.fullName || "User"}</span> requested a <span className="text-blue-300">{item.data.bed_type}</span> bed at <span className="text-gray-400">{item.data.hospital?.name}</span></p>
                    )}
                    {item.type === 'amb_request' && (
                      <p className="text-white"><span className="font-bold">{item.data.user?.fullName || "User"}</span> requested an ambulance from <span className="text-gray-400">{item.data.hospital?.name}</span></p>
                    )}
                    {item.type === 'bed_update' && (
                      <p className="text-white">Bed booking for <span className="font-bold">{item.data.user?.fullName || "User"}</span> was <span className={item.data.status === 'confirmed' ? "text-green-4Player" : "text-red-400"}>{item.data.status}</span></p>
                    )}
                    {/* --- THIS IS THE FIX for the empty items --- */}
                    {item.type === 'amb_update' && (
                      <p className="text-white">Ambulance for <span className="font-bold">{item.data.user?.fullName || "User"}</span> was <span className={item.data.status === 'confirmed' ? "text-green-400" : "text-red-400"}>{item.data.status}</span></p>
                    )}
                    <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )}
  </div>
)}


        {activeTab === "history" && (
  <div className="bg-gray-900/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-blue-500/30">
    
    {/* --- Main Title --- */}
    <div className="flex items-center justify-center gap-3 mb-8">
      <HiOutlineArchive className="w-8 h-8 text-cyan-400" />
      <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
        Approved Hospital History
      </h2>
    </div>
    
    {hospitalHistory.length === 0 ? (
      <p className="text-center text-gray-400 py-8">
        No approved hospitals found in history.
      </p>
    ) : (
      <div className="space-y-4">
        {hospitalHistory.map((hospital) => (
          <div
            key={hospital._id}
            className="bg-gray-900/70 p-5 rounded-xl border border-blue-500/30 shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Operator Info */}
              <div>
                <p className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                  <HiOutlineUserCircle /> Submitted By
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <img 
                    src={hospital.createdBy?.avatar} 
                    alt={hospital.createdBy?.fullName || "Operator"}
                    className="w-10 h-10 rounded-full border-2 border-fuchsia-500/50"
                  />
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {hospital.createdBy?.fullName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {hospital.createdBy?.email || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Hospital Info */}
              <div>
                <p className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                  <HiOutlineOfficeBuilding /> Hospital
                </p>
                <p className="text-lg font-semibold text-white">
                  {hospital.name}
                </p>
                <p className="text-sm text-gray-400">{hospital.city}</p>
              </div>

              {/* Contact Info */}
              <div>
                <p className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                  <HiOutlinePhone /> Contact
                </p>
                <p className="text-lg text-white">
                  {hospital.contact_number}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
        )}
      </main>

      <Footer isOpen={isOpen} />
    </div>
  );
};

export default AdminDashboard;