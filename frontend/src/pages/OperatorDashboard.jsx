import React, { useState, useEffect, useContext } from "react"; // --- 1. IMPORT useContext ---
import { UserContext } from "../context/UserContext"; // --- 2. IMPORT UserContext ---
import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import Footer from "../components/layout/Footer.jsx";
import { toast } from "react-hot-toast"; // --- 3. IMPORT toast ---

// --- 4. IMPORT ALL THE ICONS WE NEED ---
import {
  HiUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineBadgeCheck,
  HiPencil,
  HiOutlineOfficeBuilding,
  HiOutlineClipboardList,
  HiOutlineLocationMarker,
  HiOutlineArchive,
} from "react-icons/hi";
import { FaBed } from "react-icons/fa";
import { FaAmbulance } from "react-icons/fa";

const OperatorDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // --- 5. DELETED THE OLD 'user' LINE ---
  // const user = JSON.parse(localStorage.getItem("user"));
  
  // --- 6. ADDED THE NEW CONTEXT LINE ---
  const { user, setUser } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [contact, setContact] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [bedForm, setBedForm] = useState({
    hospital_id: "",
    bed_type: "",
    quantity: "",
    is_available: true,
    price_per_day: "",
  });
  const [quantity, setQuantity] = useState("");
  const [approvedHospitals, setApprovedHospitals] = useState([]);
  const [verifiedHospitals, setVerifiedHospitals] = useState([]);
  const [formData, setFormData] = useState({
    hospital_id: "",
    ambulance_type: "basic",
    vehicle_number: "",
    price_per_km: "",
  });
  const [ambulanceRequests, setAmbulanceRequests] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  
  // --- 7. ADDED NEW STATE & HANDLERS FOR PROFILE EDITING ---
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

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

      setUser(data.data);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileData({ fullName: user.fullName, phone: user.phone });
  };
  // --- END OF NEW LOGIC ---


  // Fetch approved hospitals
  useEffect(() => {
    const fetchApprovedHospitals = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:4000/api/hospitals/operator-approved",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setApprovedHospitals(data.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch approved hospitals", err);
      }
    };

    fetchApprovedHospitals();
  }, []);

  // ... (ALL YOUR OTHER useEffects and functions for beds, ambulances, etc. are UNCHANGED) ...
  // [your existing code for fetchPendingBookings, handleUpdateStatus, etc. goes here]
    // managing bed bookings

  useEffect(() => {
    if (activeTab === "manageBookings") {
      fetchPendingBookings();
    }
  }, [activeTab]);

  const fetchPendingBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/bookings/operator", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setPendingBookings(data.data || []);
      } else {
        console.error("❌ Error fetching operator bookings:", data.message);
      }
    } catch (err) {
      console.error("❌ Error:", err);
    }
  };

  //handle logic for approving or rejecting bookings

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:4000/api/bookings/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert(`Booking ${newStatus}`);
        fetchPendingBookings(); // Refresh list
      } else {
        alert(data.message || "Failed to update booking");
      }
    } catch (err) {
      console.error("❌ Error updating booking:", err);
    }
  };

  //ambulance addition logic
  const token = localStorage.getItem("token");

  // 🔁 Fetch hospitals created by this operator
  const fetchHospitalsForAmbulance = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/hospitals/operator", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setVerifiedHospitals(data.data || []);
    } catch (err) {
      console.error("❌ Error fetching hospitals", err);
    }
  };

  // 🔁 Add ambulance
  const handleAddAmbulance = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/ambulances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Ambulance added successfully");
        setFormData({
          hospital_id: "",
          ambulance_type: "basic",
          vehicle_number: "",
          price_per_km: "",
        });
      } else {
        alert(data.message || "❌ Failed to add ambulance");
      }
    } catch (error) {
      console.error("❌ Add ambulance error:", error);
      alert("Error occurred while adding ambulance.");
    }
  };

  // 🔃 useEffect to load hospitals when ambulance tab is active
  useEffect(() => {
    if (activeTab === "addAmbulance") {
      fetchHospitalsForAmbulance();
    }
  }, [activeTab]);

  // ambulance requests logic
  useEffect(() => {
    const fetchAmbulanceRequests = async () => {
      if (activeTab === "manageAmbulances") {
        try {
          const res = await fetch(
            "http://localhost:4000/api/ambulance-bookings/operator",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = await res.json();
          setAmbulanceRequests(data.data || []);
        } catch (err) {
          console.error("❌ Error fetching ambulance requests", err);
        }
      }
    };

    fetchAmbulanceRequests();
  }, [activeTab]);

  const handleUpdateAmbulanceStatus = async (bookingId, status) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/ambulance-bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert(`Booking ${status} successfully`);
        // Refresh the list
        setAmbulanceRequests((prev) => prev.filter((b) => b._id !== bookingId));
      } else {
        alert(data.message || "❌ Failed to update status");
      }
    } catch (error) {
      console.error("❌ Error updating status:", error);
    }
  };
  //  operator history logic

  const [bedHistory, setBedHistory] = useState([]);
  const [ambulanceHistory, setAmbulanceHistory] = useState([]);
  const [historySubTab, setHistorySubTab] = useState("bed");

  useEffect(() => {
  const fetchHistory = async () => {
    if (activeTab === "history") {
      try {
        const [bedRes, ambRes] = await Promise.all([
          fetch("http://localhost:4000/api/bookings/operator/history", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:4000/api/ambulance-bookings/operator/history", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const bedData = await bedRes.json();
        const ambData = await ambRes.json();

        if (bedRes.ok) {
          setBedHistory(bedData.data || []);
        } else {
          toast.error("Failed to load bed history");
        }

        if (ambRes.ok) {
          setAmbulanceHistory(ambData.data || []);
        } else {
          toast.error("Failed to load ambulance history");
        }
      } catch (err) {
        console.error("Error fetching history:", err);
        toast.error("Error fetching history");
      }
    }
  };

  fetchHistory();
}, [activeTab, token]);


  return (


    <div className="min-h-screen pt-20 pb-16 bg-gray-950 text-gray-200 transition-colors duration-300">
      <Header
        toggleSidebar={() => setIsOpen(!isOpen)}
        avatarUrl={user.avatar}
        name={user.fullName}
        userId={user._id}
        isOpen={isOpen}
      />
      <Sidebar
        isOpen={isOpen}
        toggleSidebar={() => setIsOpen(!isOpen)}
        setActiveTab={setActiveTab}
        role={user.role}
        activeTab={activeTab}
      />

      <main className={`p-6 flex-grow transition-all duration-300 ${isOpen ? "ml-64" : "ml-0"}`}>
        
        {/* Default View (You already updated this, it's perfect) */}
        {activeTab === "" && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <img
              src={user.avatar}
              alt="Operator Avatar"
              className="w-32 h-32 rounded-full border-4 border-fuchsia-500 
                       shadow-[0_0_25px_rgba(217,70,239,0.7),_0_0_10px_rgba(217,70,239,0.5)] mb-6"
            />
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 mb-2">
              Welcome Operator, {user.fullName}! 👷‍♂️
            </h1>
            <p className="text-gray-400 text-lg">
              You’re here to manage hospital operations!
            </p>
            <p className="text-gray-500 text-md mt-4">
              Select an option from the sidebar to get started.
            </p>
          </div>
        )}

        {/* --- 8. REPLACED YOUR OLD PROFILE TAB WITH THE NEW ONE --- */}
        {activeTab === "profile" && (
          <div className="bg-gray-900/60 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto border border-blue-500/30">
            
            {/* Profile Header */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-8">
              <img
                src={user.avatar}
                alt="User Avatar"
                className="w-32 h-32 rounded-full border-4 border-fuchsia-500 
                           shadow-[0_0_25px_rgba(217,70,239,0.7)]"
              />
              <div className="text-center sm:text-left">
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 mb-2">
                  Your Profile
                </h2>
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

        {/* Add Hospitals */}
        {activeTab === "addHospital" && (
  // --- NEW: Glassmorphic main card ---
  <div className="bg-gray-900/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto border border-blue-500/30">
    
    {/* --- NEW: Gradient Title with Icon --- */}
    <div className="flex items-center justify-center gap-3 mb-8">
      <HiOutlineOfficeBuilding className="w-8 h-8 text-cyan-400" />
      <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
        Register New Hospital
      </h2>
    </div>

    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Token missing. Please login again."); // --- NEW: Using toast ---
          return;
        }
        try {
          const res = await fetch(
            "http://localhost:4000/api/hospitals",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                name,
                address,
                city,
                contact_number: contact,
                specialization_offered: specialization
                  .split(",")
                  .map((s) => s.trim()),
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
              }),
            }
          );
          const data = await res.json();
          if (res.ok) {
            toast.success("✅ Hospital submitted for approval!"); // --- NEW: Using toast ---
            // Clear form
            setName("");
            setAddress("");
            setCity("");
            setContact("");
            setSpecialization("");
            setLatitude("");
            setLongitude("");
          } else {
            toast.error("❌ Submission failed: " + data.message); // --- NEW: Using toast ---
          }
        } catch (err) {
          console.error("Error submitting hospital:", err);
          toast.error("❌ Something went wrong"); // --- NEW: Using toast ---
        }
      }}
    >
      {/* --- NEW: Styled Inputs --- */}
      <input
        type="text"
        className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        placeholder="Hospital Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />
      <input
        type="text"
        className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        required
      />
      <input
        type="text"
        className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        placeholder="Contact Number"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        required
      />
      <input
        type="text"
        className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        placeholder="Specializations (comma-separated, e.g., acne, aids, gerd)"
        value={specialization}
        onChange={(e) => setSpecialization(e.target.value)}
        required
      />
      
      {/* --- NEW: Lat/Long in a grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="number"
          step="any" // Allows decimals
          className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="Latitude (e.g., 12.9716)"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          required
        />
        <input
          type="number"
          step="any" // Allows decimals
          className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="Longitude (e.g., 77.5946)"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          required
        />
      </div>

      {/* --- NEW: Styled Submit Button --- */}
      <button
        type="submit"
        className="w-full py-3 mt-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-all
                   shadow-[0_0_15px_rgba(59,130,246,0.6)] hover:shadow-[0_0_25px_rgba(59,130,246,0.9)]"
      >
        ➕ Submit Hospital for Approval
      </button>
    </form>
  </div>
)}

        {/* Manage Beds */}
        {activeTab === "addBeds" && (
  // --- NEW: Glassmorphic main card ---
  <div className="bg-gray-900/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto border border-blue-500/30">
    
    {/* --- NEW: Gradient Title with Icon --- */}
    <div className="flex items-center justify-center gap-3 mb-8">
      <FaBed className="w-8 h-8 text-cyan-400" />
      <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
        Add New Beds
      </h2>
    </div>

    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const formWithQuantity = {
          ...bedForm,
          quantity: parseInt(quantity),
        };
        try {
          const res = await fetch("http://localhost:4000/api/beds", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formWithQuantity),
          });
          const data = await res.json();
          if (res.ok) {
            toast.success("✅ Bed added successfully"); // --- NEW: Using toast ---
            setBedForm({
              hospital_id: "",
              bed_type: "",
              quantity: "",
              is_available: true,
              price_per_day: "",
            });
            setQuantity("");
          } else {
            toast.error(data.message || "❌ Failed to add bed"); // --- NEW: Using toast ---
          }
        } catch (err) {
          console.error("Error submitting bed:", err);
          toast.error("❌ An error occurred"); // --- NEW: Using toast ---
        }
      }}
      className="space-y-4"
    >
      {/* --- NEW: Styled Select --- */}
      <select
        className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        value={bedForm.hospital_id}
        onChange={(e) =>
          setBedForm({ ...bedForm, hospital_id: e.target.value })
        }
        required
      >
        <option value="" className="text-black">Select Approved Hospital</option>
        {approvedHospitals.map((hospital) => (
          <option key={hospital._id} value={hospital._id} className="text-black">
            {hospital.name}
          </option>
        ))}
      </select>

      {/* --- NEW: Styled Select --- */}
      <select
        className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        value={bedForm.bed_type}
        onChange={(e) =>
          setBedForm({ ...bedForm, bed_type: e.target.value })
        }
        required
      >
        <option value="" className="text-black">Select Bed Type</option>
        <option value="general" className="text-black">General</option>
        <option value="icu" className="text-black">ICU</option>
        <option value="ventilator" className="text-black">Ventilator</option>
        <option value="deluxe" className="text-black">Deluxe</option>
      </select>
      
      {/* --- NEW: Styled Inputs --- */}
      <input
        type="number"
        placeholder="Number of Beds"
        className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
      />
      
      {/* --- NEW: Styled Inputs --- */}
      <input
        type="number"
        placeholder="Price per day (₹)"
        className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        value={bedForm.price_per_day}
        onChange={(e) =>
          setBedForm({ ...bedForm, price_per_day: e.target.value })
        }
        required
      />
      
      {/* --- NEW: Styled Checkbox --- */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="w-5 h-5 rounded text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-600"
          checked={bedForm.is_available}
          onChange={(e) =>
            setBedForm({ ...bedForm, is_available: e.target.checked })
          }
        />
        <span className="text-gray-300">Mark as Available</span>
      </label>

      {/* --- NEW: Styled Submit Button (Neon Green) --- */}
      <button
        type="submit"
        className="w-full py-3 mt-4 bg-green-600 text-white rounded-lg font-semibold transition-all
                   shadow-[0_0_15px_rgba(34,197,94,0.6)] hover:shadow-[0_0_25px_rgba(34,197,94,0.9)]
                   hover:bg-green-500"
      >
        Add Bed
      </button>
    </form>
  </div>
)}

        {/* Manage Bookings */}
        {activeTab === "manageBookings" && (
  // --- NEW: Glassmorphic main card ---
  <div className="bg-gray-900/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-blue-500/30">
    
    {/* --- NEW: Gradient Title with Icon --- */}
    <div className="flex items-center justify-center gap-3 mb-8">
      <HiOutlineClipboardList className="w-8 h-8 text-cyan-400" />
      <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
        Pending Bed Bookings
      </h2>
    </div>

    {pendingBookings.length === 0 ? (
      <p className="text-center text-gray-400 py-8">No pending bookings to review.</p>
    ) : (
      // --- NEW: Replaced <table> with a list ---
      <div className="space-y-4">
        {pendingBookings.map((booking) => (
          // --- NEW: Glassmorphic Booking Card ---
          <div
            key={booking._id}
            className="bg-gray-900/70 p-5 rounded-xl border border-blue-500/30 shadow-lg"
          >
            {/* --- NEW: Grid layout for info --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* User Info */}
              <div>
                <p className="text-sm font-medium text-cyan-400">User</p>
                <p className="text-lg font-semibold text-white">
                  {booking.user.fullName}
                </p>
                <p className="text-sm text-gray-400">{booking.user.email}</p>
              </div>
              {/* Hospital Info */}
              <div>
                <p className="text-sm font-medium text-cyan-400">Hospital</p>
                <p className="text-lg font-semibold text-white">
                  {booking.hospital.name}
                </p>
              </div>
              {/* Booking Info */}
              <div>
                <p className="text-sm font-medium text-cyan-400">Details</p>
                <p className="text-md text-white">
                  Disease: {booking.disease}
                </p>
                <p className="text-md text-white capitalize">
                  Bed: {booking.bed_type}
                </p>
              </div>
            </div>

            {/* --- NEW: Styled Action Buttons --- */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-blue-500/30">
              <button
                onClick={() => handleUpdateStatus(booking._id, "confirmed")}
                className="flex-1 py-2 px-4 rounded-lg bg-green-600 text-white font-semibold transition-all
                           shadow-[0_0_15px_rgba(34,197,94,0.6)] hover:shadow-[0_0_25px_rgba(34,197,94,0.9)]
                           hover:bg-green-500"
              >
                ✅ Confirm
              </button>
              <button
                onClick={() => handleUpdateStatus(booking._id, "rejected")}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600 text-white font-semibold transition-all
                           shadow-[0_0_15px_rgba(239,68,68,0.6)] hover:shadow-[0_0_25px_rgba(239,68,68,0.9)]
                           hover:bg-red-500"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

        {/* add ambulance */}
        {activeTab === "addAmbulance" && (
  // --- NEW: Glassmorphic main card ---
  <div className="bg-gray-900/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto border border-blue-500/30">
    
    {/* --- NEW: Gradient Title with Icon --- */}
    <div className="flex items-center justify-center gap-3 mb-8">
      <FaAmbulance className="w-8 h-8 text-fuchsia-400" />
      <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
        Add New Ambulance
      </h2>
    </div>

    <form
      onSubmit={async (e) => {
        // --- YOUR FUNCTIONALITY (UNCHANGED) ---
        e.preventDefault();
        try {
          const res = await fetch("http://localhost:4000/api/ambulances", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
          });
          const data = await res.json();
          if (res.ok) {
            toast.success("✅ Ambulance added successfully"); // --- NEW: Using toast ---
            setFormData({
              hospital_id: "",
              ambulance_type: "basic",
              vehicle_number: "",
              price_per_km: "",
            });
          } else {
            toast.error(data.message || "❌ Failed to add ambulance"); // --- NEW: Using toast ---
          }
        } catch (error) {
          console.error("❌ Add ambulance error:", error);
          toast.error("Error occurred while adding ambulance."); // --- NEW: Using toast ---
        }
        // --- END OF YOUR FUNCTIONALITY ---
      }}
      className="max-w-md mx-auto space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-cyan-400 mb-1">
          Select Hospital
        </label>
        <select
          name="hospital_id"
          value={formData.hospital_id}
          onChange={(e) =>
            setFormData({ ...formData, hospital_id: e.target.value })
          }
          className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          required
        >
          <option value="" className="text-black">-- Select --</option>
          {verifiedHospitals.map((hosp) => (
            <option key={hosp._id} value={hosp._id} className="text-black">
              {hosp.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-400 mb-1">
          Ambulance Type
        </label>
        <select
          name="ambulance_type"
          value={formData.ambulance_type}
          onChange={(e) =>
            setFormData({ ...formData, ambulance_type: e.target.value })
          }
          className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          required
        >
          <option value="basic" className="text-black">Basic</option>
          <option value="icu" className="text-black">ICU</option>
          <option value="ac" className="text-black">AC</option>
          <option value="non-ac" className="text-black">Non-AC</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-400 mb-1">
          Vehicle Number
        </label>
        <input
          type="text"
          value={formData.vehicle_number}
          onChange={(e) =>
            setFormData({ ...formData, vehicle_number: e.target.value })
          }
          placeholder="e.g., KA-01-AB-1234"
          className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-400 mb-1">
          Price Per KM (₹)
        </label>
        <input
          type="number"
          value={formData.price_per_km}
          onChange={(e) =>
            setFormData({ ...formData, price_per_km: e.target.value })
          }
          placeholder="e.g., 15"
          className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          required
          min={1}
        />
      </div>

      {/* --- NEW: Styled Submit Button (Neon Pink/Fuchsia) --- */}
      <button
        type="submit"
        className="w-full py-3 mt-4 bg-fuchsia-600 text-white rounded-lg font-semibold hover:bg-fuchsia-500 transition-all
                   shadow-[0_0_15px_rgba(217,70,239,0.6)] hover:shadow-[0_0_25px_rgba(217,70,239,0.9)]"
      >
        ➕ Add Ambulance
      </button>
    </form>
  </div>
)}

        {/* Manage Ambulances */}
        {activeTab === "manageAmbulances" && (
  // --- NEW: Glassmorphic main card ---
  <div className="bg-gray-900/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-blue-500/30">
    
    {/* --- NEW: Gradient Title with Icon --- */}
    <div className="flex items-center justify-center gap-3 mb-8">
      <FaAmbulance className="w-8 h-8 text-fuchsia-400" />
      <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
        Pending Ambulance Requests
      </h2>
    </div>

    {ambulanceRequests.length === 0 ? (
      <p className="text-center text-gray-400 py-8">No pending ambulance requests.</p>
    ) : (
      // --- NEW: Replaced <ul> with a list of cards ---
      <div className="space-y-4">
        {ambulanceRequests.map((req) => (
          // --- NEW: Glassmorphic Booking Card ---
          <div
            key={req._id}
            className="bg-gray-900/70 p-5 rounded-xl border border-blue-500/30 shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* User Info */}
              <div>
                <p className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                  <HiUser /> User
                </p>
                <p className="text-lg font-semibold text-white">
                  {req.user.fullName}
                </p>
                <p className="text-sm text-gray-400">{req.user.email}</p>
              </div>
              
              {/* Hospital & Ambulance Info */}
              <div>
                <p className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                  <HiOutlineOfficeBuilding /> Hospital
                </p>
                <p className="text-lg font-semibold text-white">
                  {req.hospital.name}
                </p>
                <p className="text-sm text-gray-400 capitalize">
                  {req.ambulance.ambulance_type} - {req.ambulance.vehicle_number}
                </p>
              </div>

              {/* Location Info */}
              <div>
                <p className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                  <HiOutlineLocationMarker /> Route
                </p>
                <p className="text-md text-white">
                  <span className="text-gray-400">From:</span> {req.pickup_location}
                </p>
                <p className="text-md text-white">
                  <span className="text-gray-400">To:</span> {req.drop_location}
                </p>
              </div>
            </div>

            {/* --- NEW: Styled Action Buttons --- */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-blue-500/30">
              <button
                onClick={() => handleUpdateAmbulanceStatus(req._id, "confirmed")}
                className="flex-1 py-2 px-4 rounded-lg bg-green-600 text-white font-semibold transition-all
                           shadow-[0_0_15px_rgba(34,197,94,0.6)] hover:shadow-[0_0_25px_rgba(34,197,94,0.9)]
                           hover:bg-green-500"
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleUpdateAmbulanceStatus(req._id, "rejected")}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600 text-white font-semibold transition-all
                           shadow-[0_0_15px_rgba(239,68,68,0.6)] hover:shadow-[0_0_25px_rgba(239,68,68,0.9)]
                           hover:bg-red-500"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
        {/* Booking History */}
        {activeTab === "history" && (
        <div className="bg-gray-900/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-blue-500/30">
          
          {/* --- Main Title --- */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <HiOutlineArchive className="w-8 h-8 text-cyan-400" />
            <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
              Booking History
            </h2>
          </div>

          {/* --- NEW: SUB-TAB BUTTONS --- */}
          <div className="flex w-full mb-6">
            <button
              onClick={() => setHistorySubTab("bed")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold border-b-4 transition-all
                ${
                  historySubTab === "bed"
                    ? "text-fuchsia-400 border-fuchsia-500"
                    : "text-gray-500 border-transparent hover:text-fuchsia-300"
                }`}
            >
              <FaBed />
              Bed History ({bedHistory.length})
            </button>
            <button
              onClick={() => setHistorySubTab("ambulance")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold border-b-4 transition-all
                ${
                  historySubTab === "ambulance"
                    ? "text-fuchsia-400 border-fuchsia-500"
                    : "text-gray-500 border-transparent hover:text-fuchsia-300"
                }`}
            >
              <FaAmbulance />
              Ambulance History ({ambulanceHistory.length})
            </button>
          </div>

          {/* --- NEW: CONDITIONAL CONTENT --- */}
          
          {/* --- 1. Bed Booking History Section --- */}
          {historySubTab === "bed" && (
            <div>
              {bedHistory.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No bed booking history found.</p>
              ) : (
                <ul className="space-y-4">
                  {bedHistory.map((booking) => {
                    const statusColor =
                      booking.status === "confirmed"
                        ? "text-green-400"
                        : "text-red-400";
                    return (
                      <li key={booking._id} className="bg-gray-900/70 p-4 rounded-xl border border-blue-500/30">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-cyan-400">User</p>
                            <p className="text-white">{booking.user?.fullName || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-cyan-400">Hospital</p>
                            <p className="text-white">{booking.hospital?.name || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-cyan-400">Bed Type</p>
                            <p className="text-white capitalize">{booking.bed_type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-cyan-400">Status</p>
                            <p className={`font-semibold capitalize ${statusColor}`}>
                              {booking.status}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* --- 2. Ambulance Booking History Section --- */}
          {historySubTab === "ambulance" && (
            <div>
              {ambulanceHistory.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No ambulance booking history found.</p>
              ) : (
                <ul className="space-y-4">
                  {ambulanceHistory.map((booking) => {
                    const statusColor =
                      booking.status === "confirmed"
                        ? "text-green-400"
                        : "text-red-400";
                    return (
                      <li key={booking._id} className="bg-gray-900/70 p-4 rounded-xl border border-blue-500/30">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-cyan-400">User</p>
                            <p className="text-white">{booking.user?.fullName || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-cyan-400">Hospital</p>
                            <p className="text-white">{booking.hospital?.name || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-cyan-400">Ambulance</p>
                            <p className="text-white capitalize">
                              {booking.ambulance?.ambulance_type || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-cyan-400">Status</p>
                            <p className={`font-semibold capitalize ${statusColor}`}>
                              {booking.status}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

        </div>
)}

      </main>

      <Footer isOpen={isOpen} />
    </div>
  );
};

export default OperatorDashboard;