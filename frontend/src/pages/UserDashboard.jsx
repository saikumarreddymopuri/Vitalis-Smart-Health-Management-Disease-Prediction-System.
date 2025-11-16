import React, { useState,useRef } from "react";
import API from "../utils/api";

import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import Footer from "../components/layout/Footer.jsx";
import { useEffect } from "react";
import ViewRouteMap from "../components/Maps/ViewRouteMap.jsx";
import toast from "react-hot-toast";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { HiUser, HiOutlineMail, HiOutlinePhone, HiOutlineBadgeCheck, HiPencil } from "react-icons/hi";
import { HiOutlineBeaker, HiOutlinePlus, HiOutlineMap, HiOutlineX } from "react-icons/hi";
import { FaBed, FaAmbulance } from "react-icons/fa";
import { HiTrash, HiOutlineExclamation } from "react-icons/hi";
import { HiOutlineClock, HiOutlineFire } from "react-icons/hi";
import ReactDOM from "react-dom";

//import "../index.css"; // Ensure this is imported to apply Tailwind styles

const UserDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  // const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState(""); // to track which section is active
  const [inputSymptom, setInputSymptom] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);

  // coldstart popup states
  const [showColdStart, setShowColdStart] = useState(false);
  const coldStartTimer = useRef(null);


   

  //history of predictions
  const [history, setHistory] = useState([]);

  const [userLocation, setUserLocation] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);

  // 🆕 At top of UserDashboard.jsx (with other useState imports)
  //const [activeTab, setActiveTab] = useState("predict"); // or your default
  //const [activeTab, setActiveTab] = useState("bookBed");
  const [showBookingForm, setShowBookingForm] = useState(false); // 🆕 Controls form visibility
  const [selectedBookingInfo, setSelectedBookingInfo] = useState(null); // 🆕 Info from dashboard card
  const [bedType, setBedType] = useState("");
  const [bedsCount, setBedsCount] = useState(1);
  const [userBookings, setUserBookings] = useState([]);

  //states for maps
  // const [selectedHospital, setSelectedHospital] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [openMapId, setOpenMapId] = useState(null);
  // const [selectedHospitalForMap, setSelectedHospitalForMap] = useState(null);

  //states for ambulance booking
  const [selectedAmbulanceInfo, setSelectedAmbulanceInfo] = useState(null);
  const [ambulanceFormData, setAmbulanceFormData] = useState({
    ambulanceId: "",
    pickup_location: "",
    drop_location: "",
  });
  const [availableAmbulances, setAvailableAmbulances] = useState([]);
  const [userAmbulanceBookings, setUserAmbulanceBookings] = useState([]);

  //razorpay states for diseade and bed booking
  const [selectedBed, setSelectedBed] = useState(null); // 🛏️ selected bed info
  //const [predictedDisease, setPredictedDisease] = useState(""); // 🦠 predicted disease
  const [availableBeds, setAvailableBeds] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("⚠️ No token found. Cannot fetch history.");
        return;
      }

      try {
        const res = await API.get("/api/symptoms");
        setHistory(res.data.data);
      } catch (err) {
        console.error("❌ Failed to fetch prediction history:", err);
      }
    };

    if (activeTab === "history") {
      fetchHistory(); // ✅ only fetch when "history" tab is active
    }
  }, [activeTab]);

  const handleRemoveSymptom = (symptomToRemove) => {
    setSelectedSymptoms((prevSymptoms) =>
      prevSymptoms.filter((symptom) => symptom !== symptomToRemove)
    );
  };

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/api/bookings/user");
      setUserBookings(res.data.data || []);
    } catch (err) {
      console.error("❌ Failed to load bookings", err);
    }
  };

  useEffect(() => {
    if (activeTab === "bookBed") {
      if (!selectedBookingInfo) {
        // User came directly through sidebar — show only past bookings
        setShowBookingForm(false);
        fetchUserBookings(); // Function that fetches from GET /api/bookings/user
      }
    }
  }, [activeTab]);

  //ambulance booking logic
  useEffect(() => {
    const fetchAmbulances = async () => {
      if (activeTab === "bookAmbulance" && selectedAmbulanceInfo) {
        try {
          const token = localStorage.getItem("token");
          const res = await API.get(`/api/ambulances/${selectedAmbulanceInfo.hospitalId}`);
          setAvailableAmbulances(res.data.data || []);
        } catch (err) {
          console.error("❌ Error fetching ambulances", err);
        }
      }
    };

    const fetchUserBookings = async () => {
      if (activeTab === "bookAmbulance") {
        try {
          const token = localStorage.getItem("token");
          const res = await API.get("/api/ambulance-bookings/user");
          setUserAmbulanceBookings(res.data.data || []);
        } catch (err) {
          console.error("❌ Error fetching user ambulance bookings", err);
        }
      }
    };

    fetchAmbulances();
    fetchUserBookings();
  }, [activeTab, selectedAmbulanceInfo]);

  //razorpay payment logic

  const handlePayment = async (bookingDetails) => {
    const { amount, hospitalId, bed_id, disease, bed_type, bedsCount } =
      bookingDetails;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to make a payment.");
      return;
    }

    try {
      // --- STEP 1: Create the Razorpay Order ---
      setLoading(true); // Show loading spinner
      
      // --- THIS IS THE FIX (Line 1) ---
      // I changed the URL to /api/payments, just like your app.js
      const orderRes = await API.post("/api/payments/create-order", {
          amount: amount * bedsCount,
        });

        const order = orderRes.data.data;
        if (!order?.id) {
          throw new Error("Failed to create payment order");
        }
      
      // --- STEP 2: Open the Razorpay Popup ---
      const options = {
      key: "rzp_test_YFD4eWqY5PM6Ml",
      amount: order.amount,
      currency: "INR",
      name: "Vitalis Health Management",
      description: `Booking for ${bed_type} bed at ${selectedBookingInfo?.hospitalName}`,
      image: "https://placehold.co/100x100/007BFF/FFFFFF?text=V",
      order_id: order.id,
        
        // --- STEP 3: The Handler (Payment Success) ---
        handler: async function (response) {
        try {
          // 4️⃣ SUBMIT BED BOOKING
          const bookingRes = await API.post("/api/bookings", {
            hospitalId,
            bed_type,
            disease,
            bedsCount,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          toast.success("Payment successful! Booking request submitted.");
          await fetchUserBookings();
          setShowBookingForm(false);
          setSelectedBookingInfo(null);
        } catch (err) {
          console.error("Payment verification error:", err);
          toast.error(`Payment failed: ${err.message}`);
        } finally {
          setLoading(false);
        }
      },

      prefill: {
        name: user?.fullName || "User",
        email: user?.email || "user@example.com",
        contact: user?.phone || "9999999999",
      },

      theme: { color: "#007BFF" },

      modal: {
        ondismiss: function () {
          setLoading(false);
          toast.error("Payment cancelled.");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Payment error:", err);
    toast.error(`Error: ${err.message}`);
    setLoading(false);
  }
};
  // const handlePayment = async ({
  //   amount,
  //   hospitalId,
  //   bed_id,
  //   disease,
  //   bed_type,
  //   bedsCount,
  // }) => {
  //   console.log("📨 handlePayment called with:", {
  //     amount,
  //     hospitalId,
  //     bed_id,
  //     disease,
  //   });

  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     //alert("❌ You must be logged in to proceed");
  //     toast.error("❌ You must be logged in to proceed");
  //     return;
  //   }

  //   // Create order from backend
  //   const res = await fetch("http://localhost:4000/api/payments/create-order", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: JSON.stringify({
  //       amount,
  //       receipt: "booking_" + Date.now(),
  //     }),
  //   });

  //   const data = await res.json();
  //   console.log("📥 Order response:", data);
  //   const order = data.data;
  //   console.log("📦 Order details:", order);

  //   // 🌟 Fallback-safe booking logic
  //   const completeBooking = async () => {
  //     console.log("🔥 Booking data sending...", {
  //       hospitalId,
  //       bed_id,
  //       disease,
  //     });

  //     console.log("📤 Sending bed booking to backend");

  //     const bookRes = await fetch("http://localhost:4000/api/bookings", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         hospitalId,
  //         disease,
  //         bed_type,
  //         bedsCount: parseInt(bedsCount) || 1, // Ensure it's a number
  //       }),
  //     });

  //     const bookData = await bookRes.json();
  //     console.log("📩 Booking response:", bookData);

  //     if (bookRes.ok) {
  //       //alert("🏥 Bed booking request sent!");
  //       toast.success("🏥 Bed booking request sent!");
  //       setShowBookingForm(false);
  //       setSelectedBed(null);
  //       setActiveTab("bookBed");
  //     } else {
  //       toast.error(bookData.message || "❌ Booking failed");
  //     }
  //   };

  //   const options = {
  //     key: "rzp_test_YFD4eWqY5PM6Ml", // your Razorpay test key
  //     amount: order.amount,
  //     currency: "INR",
  //     name: "Hospman Payment",
  //     description: "Booking payment",
  //     order_id: order.id,
  //     handler: async function (response) {
  //       console.log("✅ Razorpay success - proceeding with booking");
  //       toast.success("✅ Payment successful!");
  //       await completeBooking(); // Still book
  //     },
  //     modal: {
  //       ondismiss: async function () {
  //         console.log("⛔ Razorpay closed or failed - proceeding anyway");
  //         // alert(
  //         //   "⚠️ Payment cancelled or failed. Proceeding with booking anyway."
  //         // );
  //         toast.error("⚠️ Payment cancelled or failed. Proceeding with booking anyway.");
  //         await completeBooking(); // Still book
  //       },
  //     },
  //     prefill: {
  //       name: "Test User",
  //       email: "test@example.com",
  //     },
  //     theme: {
  //       color: "#9155FD",
  //     },
  //     method: {
  //       upi: true,
  //       card: true,
  //     },
  //   };

  //   const rzp = new window.Razorpay(options);
  //   rzp.open();
  // };

  useEffect(() => {
    const fetchBeds = async () => {
      if (selectedBookingInfo?.hospitalId) {
        const token = localStorage.getItem("token");

        try {
          const res = await API.get(`/api/beds/${selectedBookingInfo.hospitalId}`);

          setAvailableBeds(res.data.data || []);
        } catch (err) {
          console.error("Error fetching beds:", err);
        }
      }
    };

    fetchBeds();
  }, [selectedBookingInfo]);



  const { user, setUser } = useContext(UserContext);

  // editable profile
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
      const res = await API.patch("/api/v1/users/update-me", profileData);

      setUser(res.data.data);

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

 // deleting bedbooking history

 const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --- New function to delete a single booking ---
  const handleDeleteBooking = async (bookingId) => {
    // We don't need a confirmation for a single delete, just do it
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/api/bookings/${bookingId}`);

      setUserBookings((prev) => prev.filter((b) => b._id !== bookingId));
      toast.success("Booking removed from history!");

    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- New function to delete ALL bookings ---
  const handleDeleteAllBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.delete("/api/bookings/user/all");

      setUserBookings([]);
      toast.success("Bed booking history cleared!");
      
    } catch (err) {
      toast.error(err.message);
    } finally {
      setShowDeleteModal(false); // Close the modal
    }
  };

  // --- This is the new Confirmation Modal Component ---
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-full max-w-sm text-white border border-red-500/30">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-red-600/20 border border-red-500/50 mb-4">
            <HiOutlineExclamation className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Are you sure?</h3>
          <p className="text-gray-400 mb-6">
            This will permanently delete all your bed booking history. This action cannot be undone.
          </p>
          <div className="flex justify-center gap-4 w-full">
            <button
              onClick={handleDeleteAllBookings}
              className="w-full px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-medium transition-all
                         shadow-[0_0_15px_rgba(239,68,68,0.6)] hover:shadow-[0_0_25px_rgba(239,68,68,0.9)]"
            >
              Yes, Delete All
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="w-full px-6 py-2 rounded-lg bg-gray-700/50 border border-gray-600 hover:bg-gray-700/80 font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

 // ambulance booking deletion logic

 const [showAmbulanceDeleteModal, setShowAmbulanceDeleteModal] = useState(false);

  // --- New function to delete a single ambulance booking ---
  const handleDeleteAmbulanceBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/api/ambulance-bookings/${bookingId}`);

      setUserAmbulanceBookings((prev) =>
        prev.filter((b) => b._id !== bookingId)
      );

      toast.success("Ambulance booking removed!");

    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- New function to delete ALL ambulance bookings ---
  const handleDeleteAllAmbulanceBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.delete("/api/ambulance-bookings/user/all");

      setUserAmbulanceBookings([]);
      toast.success("Ambulance booking history cleared!");
      
    } catch (err) {
      toast.error(err.message);
    } finally {
      setShowAmbulanceDeleteModal(false); // Close the modal
    }
  };

  // --- This is the new Confirmation Modal Component for Ambulances ---
  const DeleteAmbulanceModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-full max-w-sm text-white border border-red-500/30">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-red-600/20 border border-red-500/50 mb-4">
            <HiOutlineExclamation className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Are you sure?</h3>
          <p className="text-gray-400 mb-6">
            This will permanently delete all your ambulance booking history. This action cannot be undone.
          </p>
          <div className="flex justify-center gap-4 w-full">
            <button
              onClick={handleDeleteAllAmbulanceBookings}
              className="w-full px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-medium transition-all
                         shadow-[0_0_15px_rgba(239,68,68,0.6)] hover:shadow-[0_0_25px_rgba(239,68,68,0.9)]"
            >
              Yes, Delete All
            </button>
            <button
              onClick={() => setShowAmbulanceDeleteModal(false)}
              className="w-full px-6 py-2 rounded-lg bg-gray-700/50 border border-gray-600 hover:bg-gray-700/80 font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );


  // delete prediction history logic

  const [showHistoryDeleteModal, setShowHistoryDeleteModal] = useState(false);

  // --- New function to delete a single prediction ---
  const handleDeletePrediction = async (predictionId) => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/api/symptoms/${predictionId}`);

      setHistory((prev) => prev.filter((p) => p._id !== predictionId));
      toast.success("Prediction removed!");

    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- New function to delete ALL predictions ---
  const handleDeleteAllHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.delete("/api/symptoms/user/all");

      setHistory([]);
      toast.success("Prediction history cleared!");
      
    } catch (err) {
      toast.error(err.message);
    } finally {
      setShowHistoryDeleteModal(false); // Close the modal
    }
  };

  // --- This is the new Confirmation Modal Component for Prediction History ---
  const DeleteHistoryModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-full max-w-sm text-white border border-red-500/30">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-red-600/20 border border-red-500/50 mb-4">
            <HiOutlineExclamation className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Are you sure?</h3>
          <p className="text-gray-400 mb-6">
            This will permanently delete all your prediction history. This action cannot be undone.
          </p>
          <div className="flex justify-center gap-4 w-full">
            <button
              onClick={handleDeleteAllHistory}
              className="w-full px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-medium transition-all
                         shadow-[0_0_15px_rgba(239,68,68,0.6)] hover:shadow-[0_0_25px_rgba(239,68,68,0.9)]"
            >
              Yes, Delete All
            </button>
            <button
              onClick={() => setShowHistoryDeleteModal(false)}
              className="w-full px-6 py-2 rounded-lg bg-gray-700/50 border border-gray-600 hover:bg-gray-700/80 font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );




  return (
  // --- NEW: Main container with permanent dark theme ---
  <div className="min-h-screen pt-20 pb-16 bg-gray-950 text-gray-200 transition-colors duration-300">
    <Header
      toggleSidebar={() => setIsOpen(!isOpen)}
      avatarUrl={user.avatar}
      name={user.fullName}
      userId={user._id} // --- I assume you have user._id here for notifications ---
      isOpen={isOpen}
    />
    <Sidebar
      isOpen={isOpen}
      toggleSidebar={() => setIsOpen(!isOpen)}
      setActiveTab={setActiveTab}
      role={user.role}
      activeTab={activeTab} // --- Pass activeTab to the new Sidebar ---
    />
    <Footer isOpen={isOpen} /> {/* --- I uncommented your Footer --- */}

    {/* --- Main content area --- */}
    <main className={`p-6 flex-grow transition-all duration-300 ${isOpen ? "ml-64" : "ml-0"}`}>
      
      {/* --- NEW: Styled Welcome Screen --- */}
        {activeTab === "" && (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
          
          {/* --- NEW: Glowing Avatar --- */}
          <img
            src={user.avatar}
            alt="User Avatar"
            className="w-32 h-32 rounded-full border-4 border-fuchsia-500 
                       shadow-[0_0_25px_rgba(217,70,239,0.7),_0_0_10px_rgba(217,70,239,0.5)] mb-6"
          />
          
          {/* --- NEW: Styled Title with Cyber Pink/Blue Gradient --- */}
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 mb-2">
            Welcome to VITALIS, {user.fullName}!
          </h1>
          
          <p className="text-gray-400 text-lg">
            We’re glad to have you on board!
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
          Your Profile
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


        {activeTab === "know" && (
  // Glassmorphic main card
  <div className="bg-gray-900/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-blue-500/30">
    
    {/* Gradient Title */}
    <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 mb-8">
      Symptom Analyzer
    </h2>

    {/* Styled Symptom Selection */}
    <div className="flex items-center gap-3 mb-4">
      <select
        className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        value={inputSymptom}
        onChange={(e) => setInputSymptom(e.target.value)}
      >
        <option value="" className="text-black">-- Select a symptom --</option>
        {[
          "abdominal_pain",
          "abnormal_menstruation",
          "acidity",
          "acute_liver_failure",
          "altered_sensorium",
          "anxiety",
          "back_pain",
          "belly_pain",
          "blackheads",
          "bladder_discomfort",
          "blister",
          "blood_in_sputum",
          "bloody_stool",
          "blurred_and_distorted_vision",
          "breathlessness",
          "brittle_nails",
          "bruising",
          "burning_micturition",
          "chest_pain",
          "chills",
          "cold_hands_and_feets",
          "coma",
          "congestion",
          "constipation",
          "continuous_feel_of_urine",
          "continuous_sneezing",
          "cough",
          "cramps",
          "dark_urine",
          "dehydration",
          "depression",
          "diarrhoea",
          "dischromic _patches",
          "distention_of_abdomen",
          "dizziness",
          "drying_and_tingling_lips",
          "enlarged_thyroid",
          "excessive_hunger",
          "extra_marital_contacts",
          "family_history",
          "fast_heart_rate",
          "fatigue",
          "fluid_overload",
          "foul_smell_of urine",
          "headache",
          "high_fever",
          "hip_joint_pain",
          "history_of_alcohol_consumption",
          "increased_appetite",
          "indigestion",
          "inflammatory_nails",
          "internal_itching",
          "irregular_sugar_level",
          "irritability",
          "irritation_in_anus",
          "itching",
          "joint_pain",
          "knee_pain",
          "lack_of_concentration",
          "lethargy",
          "loss_of_appetite",
          "loss_of_balance",
          "loss_of_smell",
          "malaise",
          "mild_fever",
          "mood_swings",
          "movement_stiffness",
          "mucoid_sputum",
          "muscle_pain",
          "muscle_wasting",
          "muscle_weakness",
          "nausea",
          "neck_pain",
          "nodal_skin_eruptions",
          "obesity",
          "pain_behind_the_eyes",
          "pain_during_bowel_movements",
          "pain_in_anal_region",
          "painful_walking",
          "palpitations",
          "passage_of_gases",
          "patches_in_throat",
          "phlegm",
          "polyuria",
          "prominent_veins_on_calf",
          "puffy_face_and_eyes",
          "pus_filled_pimples",
          "receiving_blood_transfusion",
          "receiving_unsterile_injections",
          "red_sore_around_nose",
          "red_spots_over_body",
          "redness_of_eyes",
          "restlessness",
          "runny_nose",
          "rusty_sputum",
          "scurring",
          "shivering",
          "silver_like_dusting",
          "sinus_pressure",
          "skin_peeling",
          "skin_rash",
          "slurred_speech",
          "small_dents_in_nails",
          "spinning_movements",
          "spotting_ urination",
          "stiff_neck",
          "stomach_bleeding",
          "stomach_pain",
          "sunken_eyes",
          "sweating",
          "swelled_lymph_nodes",
          "swelling_joints",
          "swelling_of_stomach",
          "swollen_blood_vessels",
          "swollen_extremeties",
          "swollen_legs",
          "throat_irritation",
          "toxic_look_(typhos)",
          "ulcers_on_tongue",
          "unsteadiness",
          "visual_disturbances",
          "vomiting",
          "watering_from_eyes",
          "weakness_in_limbs",
          "weakness_of_one_body_side",
          "weight_gain",
          "weight_loss",
          "yellow_crust_ooze",
          "yellow_urine",
          "yellowing_of_eyes",
          "yellowish_skin",
        ].map((symptom) => (
          <option key={symptom} value={symptom} className="text-black">
            {symptom}
          </option>
        ))}
      </select>
      
      {/* Styled Add Button */}
      <button
        onClick={() => {
          if (
            inputSymptom &&
            !selectedSymptoms.includes(inputSymptom)
          ) {
            setSelectedSymptoms([...selectedSymptoms, inputSymptom]);
            setInputSymptom("");
          }
        }}
        className="flex-shrink-0 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all
                   shadow-[0_0_15px_rgba(59,130,246,0.6)] hover:shadow-[0_0_25px_rgba(59,130,246,0.9)]"
        title="Add symptom"
      >
        <HiOutlinePlus className="w-5 h-5" />
      </button>
    </div>

    {/* Styled Selected Symptoms (NEON PINK) */}
    {selectedSymptoms.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedSymptoms.map((symptom, index) => (
          <span
            key={index}
            className="flex items-center bg-fuchsia-600/30 border border-fuchsia-500/50 text-fuchsia-300 px-3 py-1 rounded-full text-sm font-medium"
          >
            {symptom}
            <button
              onClick={() => handleRemoveSymptom(symptom)}
              className="ml-2 text-fuchsia-300 hover:text-white"
              title="Remove symptom"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    )}

    {/* --- THIS IS THE FIX --- */}
    {/* --- I HAVE PASTED YOUR ORIGINAL onClick LOGIC BACK IN --- */}
    {/* Small Note Box */}
{selectedSymptoms.length < 2 && (
  <div className="text-yellow-300 bg-yellow-600/20 border border-yellow-500/40 px-4 py-2 rounded-lg text-sm mb-3">
    ⚠️ Please select at least <b>2 symptoms</b> to get an accurate prediction.
  </div>
)}

<button
  onClick={async () => {
    if (selectedSymptoms.length < 2) {
      toast.error("Please select at least 2 symptoms.");
      return;
    }

    setLoading(true);
    setShowColdStart(false); // reset popup first

    // 🔥 Start cold-start timer (3 sec delay)
    coldStartTimer.current = setTimeout(() => {
      setShowColdStart(true);
    }, 3000);

    try {
      const predictRes = await API.post("/api/symptoms/predict", {
        symptoms: selectedSymptoms,
      });

      const predictedDisease = predictRes.data.data.predicted_disease;
      setPrediction(predictedDisease);

      // 🌟 Clear popup as soon as success arrives
      clearTimeout(coldStartTimer.current);
      setShowColdStart(false);

      // -------------------
      // FETCH HOSPITALS
      // -------------------
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });

          const token = localStorage.getItem("token");
          if (!token) return;

          try {
            const hospitalsRes = await API.get(
              `/api/hospitals/nearby-by-disease`,
              {
                params: {
                  disease: predictedDisease.toLowerCase(),
                  userLat: latitude,
                  userLng: longitude,
                },
              }
            );

            setNearbyHospitals(hospitalsRes.data.data || []);
          } catch (err) {
            console.error("Nearby hospital fetch error:", err);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          toast.error("Please allow location access to find nearby hospitals.");
        }
      );

      // SAVE PREDICTION
      const token = localStorage.getItem("token");
      if (token) {
        await API.post("/api/symptoms", {
          symptom_list: selectedSymptoms,
          predicted_disease: predictedDisease,
        });
      }
    } catch (err) {
      console.error("❌ Error in prediction or saving:", err);

      // 💥 Make sure popup hides even on error
      clearTimeout(coldStartTimer.current);
      setShowColdStart(false);
    } finally {
      setLoading(false);

      // 💥 Ensure popup is hidden after everything finishes
      clearTimeout(coldStartTimer.current);
      setShowColdStart(false);
    }
  }}
  className={`w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg font-semibold transition-all
    shadow-[0_0_15px_rgba(34,197,94,0.6)] hover:shadow-[0_0_25px_rgba(34,197,94,0.9)]
    hover:bg-green-500
    ${loading || selectedSymptoms.length < 2 ? "opacity-50 cursor-not-allowed" : ""}
  `}
  disabled={loading || selectedSymptoms.length < 2}
>
  Predict Disease
</button>

{/* ⭐ Cold Start Popup */}
{showColdStart && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
    <div className="bg-gray-900 p-6 rounded-xl border border-blue-500/40 shadow-xl text-center">
      <h3 className="text-xl font-semibold text-blue-300 flex items-center gap-2 justify-center">
        ⚡ Server Waking Up
      </h3>
      <p className="text-gray-300 mt-2">
        The prediction engine is starting (cold start). Please wait a moment...
      </p>
    </div>
  </div>
)}


    {/* --- END OF FIX --- */}

    {/* Styled Prediction Result */}
    {prediction && (
      <div className="mt-8 text-center p-6 bg-gray-900/70 rounded-2xl border border-blue-500/30">
        <h3 className="text-lg font-semibold text-cyan-400">
          🩺 Predicted Disease:
        </h3>
        <p className="text-4xl font-bold mt-2 text-green-400">
          {prediction}
        </p>
      </div>
    )}

    {/* Styled Hospital List */}
    {nearbyHospitals.length > 0 && (
      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-cyan-400 mb-4">
          🏥 Nearby Hospitals:
        </h3>
        <ul className="space-y-4">
          {nearbyHospitals.map((hosp) => (
            // Glassmorphic Hospital Card
            <li
              key={hosp._id}
              className="bg-gray-900/60 backdrop-blur-lg p-4 rounded-2xl border border-blue-500/30 shadow-xl"
            >
              <p className="font-bold text-white text-xl">{hosp.name}</p>
              <p className="text-sm text-gray-400">
                {hosp.specialization_offered} • {hosp.distance} km away
              </p>
              
              {/* Styled Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setUserCoords({
                          lat: position.coords.latitude,
                          lng: position.coords.longitude,
                        });
                        setOpenMapId(hosp._id);
                      },
                      (err) => {
                        console.error("Geolocation error:", err);
                        toast.error(
                          "Please allow location access to view the route."
                        );
                      }
                    );
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg border border-green-500/70 bg-green-600/30 text-green-300 
                             font-medium hover:bg-green-600/60 hover:text-white transition duration-200 
                             shadow-md hover:shadow-green-500/50"
                >
                  <HiOutlineMap /> View Route
                </button>
                
                <button
                  onClick={() => {
                    setSelectedBookingInfo({
                      hospitalId: hosp._id,
                      hospitalName: hosp.name,
                      disease: prediction,
                    });
                    setShowBookingForm(true);
                    setActiveTab("bookBed");
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg border border-blue-500/70 bg-blue-600/30 text-blue-300 
                             font-medium hover:bg-blue-600/60 hover:text-white transition duration-200 
                             shadow-md hover:shadow-blue-500/50"
                >
                  <FaBed /> Book Bed
                </button>
                
                <button
                  onClick={() => {
                    setSelectedAmbulanceInfo({
                      hospitalId: hosp._id,
                      hospitalName: hosp.name,
                      disease: prediction,
                    });
                    setActiveTab("bookAmbulance");
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg border border-fuchsia-500/70 bg-fuchsia-600/30 text-fuchsia-300 
                             font-medium hover:bg-fuchsia-600/60 hover:text-white transition duration-200 
                             shadow-md hover:shadow-fuchsia-500/50"
                >
                  <FaAmbulance /> Book Ambulance
                </button>
              </div>

              {/* Styled Map Block */}
              {openMapId === hosp._id && userCoords && (
                <div className="mt-4 p-4 rounded-lg bg-gray-900/80 border border-blue-500/30 shadow-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-md font-semibold text-gray-300">
                      📍 Route to: {hosp.name}
                    </h4>
                    <button
                      onClick={() => setOpenMapId(null)}
                      className="text-red-400 hover:text-white"
                    >
                      <HiOutlineX />
                    </button>
                  </div>
                  <ViewRouteMap
                    userCoords={userCoords}
                    hospitalCoords={{
                      lat: hosp.latitude,
                      lng: hosp.longitude,
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
        )}

        {activeTab === "bookBed" && (
  <div className="bg-gray-900/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-blue-500/30">
    {showBookingForm ? (
      <>
        {/* --- 1. THIS IS YOUR BOOKING FORM (STYLED TO MATCH) --- */}
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 mb-6">
          📝 Book a Bed at {selectedBookingInfo?.hospitalName}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const bed = availableBeds.find(
              (b) => b.bed_type === bedType
            );
            if (!bed) {
              toast.error("❌ Invalid bed type");
              return;
            }
            handlePayment({
              amount: bed.price_per_day,
              hospitalId: selectedBookingInfo.hospitalId,
              bed_id: bed._id,
              disease: selectedBookingInfo.disease,
              bed_type: bedType,
              bedsCount: parseInt(bedsCount) || 1,
            });
          }}
          className="space-y-4"
        >
          {/* Bed Type */}
          <select
            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={bedType}
            onChange={(e) => setBedType(e.target.value)}
            required
          >
            <option value="" className="text-black">Select Bed Type</option>
            {availableBeds.length > 0 ? (
              availableBeds.map((bed) => (
                <option key={bed._id} value={bed.bed_type} className="text-black">
                  {bed.bed_type.charAt(0).toUpperCase() + bed.bed_type.slice(1)} 
                  (₹{bed.price_per_day}/day) - {bed.availableBeds} available
                </option>
              ))
            ) : (
              <option disabled className="text-black">Loading beds...</option>
            )}
          </select>

          {/* Number of Beds */}
          <input
            type="number"
            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={bedsCount}
            onChange={(e) => setBedsCount(e.target.value)}
            placeholder="Number of Beds"
            min={1}
            required
          />

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className={`w-full py-3 bg-green-600 text-white rounded-lg font-semibold transition-all
                          shadow-[0_0_15px_rgba(34,197,94,0.6)] hover:shadow-[0_0_25px_rgba(34,197,94,0.9)]
                          hover:bg-green-500
                          ${
                            loading || !bedType
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
              disabled={loading || !bedType}
            >
              {loading ? "Processing..." : "✅ Proceed to Pay"}
            </button>

            <button
              type="button"
              className="w-full px-6 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-300
                         font-medium hover:bg-gray-700/80 transition duration-200"
              onClick={() => {
                setShowBookingForm(false);
                setSelectedBookingInfo(null);
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </>
    ) : (
      <>
        {/* --- 2. THIS IS YOUR NEW HISTORY LIST (STYLED) --- */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
            Bed Booking History
          </h2>
          {userBookings.length > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)} // --- This opens the modal ---
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-red-500/70 bg-red-600/30 text-red-300 
                         font-medium hover:bg-red-600/60 hover:text-white transition duration-200 
                         shadow-[0_0_10px_rgba(239,68,68,0.4)]"
            >
              <HiTrash />
              Delete All History
            </button>
          )}
        </div>

        {userBookings.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No past bookings yet.</p>
        ) : (
          <ul className="space-y-4">
            {userBookings.map((booking) => {
              // --- Determine status color ---
              const statusColor =
                booking.status === "confirmed"
                  ? "text-green-400 border-green-500/50 bg-green-600/20"
                  : booking.status === "pending"
                  ? "text-orange-400 border-orange-500/50 bg-orange-600/20"
                  : "text-red-400 border-red-500/50 bg-red-600/20";

              return (
                <li
                  key={booking._id}
                  className="bg-gray-900/70 p-4 rounded-xl border border-blue-500/30 shadow-lg space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-400">Hospital</p>
                      <p className="font-bold text-white text-lg">
                        {booking.hospital?.name || "Deleted Hospital"}
                      </p>
                    </div>
                    {/* --- Remove Button --- */}
                    <button
                      onClick={() => handleDeleteBooking(booking._id)}
                      className="p-1.5 rounded-full text-gray-500 hover:bg-red-600/30 hover:text-red-400 transition-all"
                      title="Remove from history"
                    >
                      <HiOutlineX className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Bed Type</p>
                      <p className="font-medium text-white capitalize">{booking.bed_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Disease</p>
                      <p className="font-medium text-white capitalize">{booking.disease}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <span
                        className={`capitalize px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </>
    )}
    
    {/* --- 3. This renders the delete confirmation modal --- */}
    {showDeleteModal && ReactDOM.createPortal(
      <DeleteConfirmationModal />,
      document.getElementById("modal-root") // We use the portal just like in the Header
    )}
    
  </div>
        )}

        {activeTab === "bookAmbulance" && (
  <div className="bg-gray-900/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-blue-500/30">
    {selectedAmbulanceInfo ? (
      <>
        {/* --- 1. THIS IS YOUR BOOKING FORM (STYLED TO MATCH) --- */}
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 mb-6">
          🚑 Book an Ambulance
        </h2>
        
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const token = localStorage.getItem("token");
            try {
              const res = await API.post("/api/ambulance-bookings", {
                hospitalId: selectedAmbulanceInfo.hospitalId,
                ambulanceId: ambulanceFormData.ambulanceId,
                disease: selectedAmbulanceInfo.disease,
                pickup_location: ambulanceFormData.pickup_location,
                drop_location: ambulanceFormData.drop_location,
              });

              toast.success("✅ Ambulance booking request sent!");

              setAmbulanceFormData({
                ambulanceId: "",
                pickup_location: "",
                drop_location: "",
              });

              setSelectedAmbulanceInfo(null);

              // Refresh user ambulance bookings
              fetchUserBookings();

            } catch (err) {
              toast.error(
                err.response?.data?.message || "❌ Booking failed."
              );
            }
          }}
          className="space-y-4"
        >
          {/* Hospital (Disabled) */}
          <div>
            <label className="text-sm font-medium text-gray-400">Hospital</label>
            <input
              value={selectedAmbulanceInfo.hospitalName}
              disabled
              className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-400"
            />
          </div>

          {/* Disease (Disabled) */}
          <div>
            <label className="text-sm font-medium text-gray-400">Disease</label>
            <input
              value={selectedAmbulanceInfo.disease}
              disabled
              className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-400"
            />
          </div>

          {/* Ambulance Type */}
          <div>
            <label className="text-sm font-medium text-gray-400">Ambulance Type</label>
            <select
              value={ambulanceFormData.ambulanceId}
              onChange={(e) =>
                setAmbulanceFormData({
                  ...ambulanceFormData,
                  ambulanceId: e.target.value,
                })
              }
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            >
              <option value="" className="text-black">-- Select Ambulance --</option>
              {availableAmbulances.map((amb) => (
                <option key={amb._id} value={amb._id} className="text-black">
                  {amb.ambulance_type} - {amb.vehicle_number} (₹{amb.price_per_km}/km)
                </option>
              ))}
            </select>
          </div>

          {/* Pickup Location */}
          <div>
            <label className="text-sm font-medium text-gray-400">Pickup Location</label>
            <input
              value={ambulanceFormData.pickup_location}
              onChange={(e) =>
                setAmbulanceFormData({
                  ...ambulanceFormData,
                  pickup_location: e.target.value,
                })
              }
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>

          {/* Drop Location */}
          <div>
            <label className="text-sm font-medium text-gray-400">Drop Location</label>
            <input
              value={ambulanceFormData.drop_location}
              onChange={(e) =>
                setAmbulanceFormData({
                  ...ambulanceFormData,
                  drop_location: e.target.value,
                })
              }
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-fuchsia-600 text-white rounded-lg font-semibold hover:bg-fuchsia-500 transition-all
                         shadow-[0_0_15px_rgba(217,70,239,0.6)] hover:shadow-[0_0_25px_rgba(217,70,239,0.9)]"
            >
              📤 Confirm Booking
            </button>
            <button
              type="button"
              className="w-full px-6 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-300
                         font-medium hover:bg-gray-700/80 transition duration-200"
              onClick={() => {
                setSelectedAmbulanceInfo(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </>
    ) : (
      <>
        {/* --- 2. THIS IS YOUR NEW HISTORY LIST (STYLED) --- */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
            Ambulance Booking History
          </h2>
          {userAmbulanceBookings.length > 0 && (
            <button
              onClick={() => setShowAmbulanceDeleteModal(true)} // --- This opens the modal ---
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-red-500/70 bg-red-600/30 text-red-300 
                         font-medium hover:bg-red-600/60 hover:text-white transition duration-200 
                         shadow-[0_0_10px_rgba(239,68,68,0.4)]"
            >
              <HiTrash />
              Delete All History
            </button>
          )}
        </div>

        {userAmbulanceBookings.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No past bookings yet.</p>
        ) : (
          <ul className="space-y-4">
            {userAmbulanceBookings.map((booking) => {
              // --- Determine status color ---
              const statusColor =
                booking.status === "confirmed"
                  ? "text-green-400 border-green-500/50 bg-green-600/20"
                  : booking.status === "pending"
                  ? "text-orange-400 border-orange-500/50 bg-orange-600/20"
                  : "text-red-400 border-red-500/50 bg-red-600/20";

              return (
                <li
                  key={booking._id}
                  className="bg-gray-900/70 p-4 rounded-xl border border-blue-500/30 shadow-lg space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-400">Hospital</p>
                      <p className="font-bold text-white text-lg">
                        {/* --- FIX: Added optional chaining --- */}
                        {booking.hospital?.name || "Deleted Hospital"}
                      </p>
                    </div>
                    {/* --- Remove Button --- */}
                    <button
                      onClick={() => handleDeleteAmbulanceBooking(booking._id)}
                      className="p-1.5 rounded-full text-gray-500 hover:bg-red-600/30 hover:text-red-400 transition-all"
                      title="Remove from history"
                    >
                      <HiOutlineX className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Vehicle</p>
                      <p className="font-medium text-white capitalize">
                        {/* --- FIX: Added optional chaining --- */}
                        {booking.ambulance?.vehicle_number || "N/A"} (
                        {booking.ambulance?.ambulance_type || "N/A"})
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <span
                        className={`capitalize px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </>
    )}
    
    {/* --- 3. This renders the delete confirmation modal --- */}
    {showAmbulanceDeleteModal && ReactDOM.createPortal(
      <DeleteAmbulanceModal />,
      document.getElementById("modal-root") // We use the portal
    )}
    
  </div>
        )}

        {activeTab === "history" && (
  <div className="bg-gray-900/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-blue-500/30">
    
    {/* --- 1. THIS IS YOUR NEW HISTORY LIST (STYLED) --- */}
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
        Prediction History
      </h2>
      {history.length > 0 && (
        <button
          onClick={() => setShowHistoryDeleteModal(true)} // --- This opens the modal ---
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-red-500/70 bg-red-600/30 text-red-300 
                     font-medium hover:bg-red-600/60 hover:text-white transition duration-200 
                     shadow-[0_0_10px_rgba(239,68,68,0.4)]"
        >
          <HiTrash />
          Delete All History
        </button>
      )}
    </div>

    {history.length === 0 ? (
      <p className="text-center text-gray-400 py-8">No past predictions found.</p>
    ) : (
      <div className="space-y-4">
        {history.map((item) => (
          <div
            key={item._id}
            className="bg-gray-900/70 p-4 rounded-xl border border-blue-500/30 shadow-lg"
          >
            <div className="flex justify-between items-start">
              {/* --- Date --- */}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <HiOutlineClock />
                <span>{new Date(item.predictionDate).toLocaleString()}</span>
              </div>
              {/* --- Remove Button --- */}
              <button
                onClick={() => handleDeletePrediction(item._id)}
                className="p-1.5 rounded-full text-gray-500 hover:bg-red-600/30 hover:text-red-400 transition-all"
                title="Remove from history"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {/* --- Symptoms --- */}
              <div className="flex items-start gap-2">
                <HiOutlineFire className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-fuchsia-400">Symptoms</p>
                  <p className="text-gray-300 text-sm">
                    {item.symptomList.join(", ")}
                  </p>
                </div>
              </div>
              {/* --- Predicted Disease --- */}
              <div className="flex items-start gap-2">
                <HiOutlineBeaker className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-400">Predicted Disease</p>
                  <p className="font-semibold text-green-300 capitalize">
                    {item.predictedDisease}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
    
    {/* --- 2. This renders the delete confirmation modal --- */}
    {showHistoryDeleteModal && ReactDOM.createPortal(
      <DeleteHistoryModal />,
      document.getElementById("modal-root") // We use the portal
    )}
    
  </div>
        )}
      </main>

      <Footer isOpen={isOpen} />
    </div>
  );
};

export default UserDashboard;
