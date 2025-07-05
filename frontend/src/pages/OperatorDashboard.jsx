import React, { useState ,useEffect } from "react";
import Header from "../components/Layout/Header.jsx";
import Sidebar from "../components/Layout/Sidebar.jsx";
import Footer from "../components/Layout/Footer.jsx";

const OperatorDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [contact, setContact] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  // Bed addition
  const [bedForm, setBedForm] = useState({
    hospital_id: "",
    bed_type: "",
    quantity: "", // Removed as we are using a separate state for quantity
    is_available: true,
    price_per_day: "",
  });
  const [quantity, setQuantity] = useState(""); // New state for quantity
  const [approvedHospitals, setApprovedHospitals] = useState([]);

  // 🟪 Ambulance States
const [verifiedHospitals, setVerifiedHospitals] = useState([]);
const [formData, setFormData] = useState({
  hospital_id: "",
  ambulance_type: "basic",
  vehicle_number: "",
  price_per_km: "",
});

// ambulance requests
const [ambulanceRequests, setAmbulanceRequests] = useState([]);




// Fetch approved hospitals 
  useEffect(() => {
  const fetchApprovedHospitals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/hospitals/operator-approved", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setApprovedHospitals(data.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch approved hospitals", err);
    }
  };

  fetchApprovedHospitals();
}, []);


// managing bed bookings

const [pendingBookings, setPendingBookings] = useState([]);

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
    const res = await fetch(`http://localhost:4000/api/bookings/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

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
        const res = await fetch("http://localhost:4000/api/ambulance-bookings/operator", {
          headers: { Authorization: `Bearer ${token}` },
        });
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
    const res = await fetch(`http://localhost:4000/api/ambulance-bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

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





  // ✅ Logs outside JSX — safe
  console.log("Operator Role:", user.role);
  console.log("Current activeTab:", activeTab);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header
        toggleSidebar={() => setIsOpen(!isOpen)}
        avatarUrl={user.avatar}
        name={user.fullName}
      />

      <Sidebar
        isOpen={isOpen}
        toggleSidebar={() => setIsOpen(!isOpen)}
        setActiveTab={setActiveTab}
        role={user.role}
      />

      <main className="ml-0 md:ml-64 p-6 flex-grow">
        {/* Default View */}
        {activeTab === "" && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <img
              src={user.avatar}
              alt="Operator Avatar"
              className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg mb-4"
            />
            <h1 className="text-3xl font-bold text-blue-700 mb-2">
              Welcome Operator 👷‍♂️
            </h1>
            <p className="text-gray-600">
              You’re here to manage hospital operations!
            </p>
          </div>
        )}

        {/* Profile Section */}
        {activeTab === "profile" && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Your Profile</h2>
            <p><strong>Name:</strong> {user.fullName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        )}
        {/* Add Hospitals */}

        {activeTab === "addHospital" && (
          <div className="bg-white p-6 rounded shadow max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">Add Hospital</h2>

            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();

                const token = localStorage.getItem("token");
                if (!token) {
                  alert("Token missing. Please login again.");
                  return;
                }

                try {
                  const res = await fetch("http://localhost:4000/api/hospitals", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      name,
                      address,
                      city,
                      contact_number:contact,
                      specialization_offered: specialization.split(",").map(s => s.trim()),
                      latitude: parseFloat(latitude),
                      longitude: parseFloat(longitude),
                    }),
                  });

                  const data = await res.json();
                  if (res.ok) {
                    alert("✅ Hospital submitted for approval!");
                    // Clear form
                    setName(""); setAddress(""); setCity(""); setContact(""); setSpecialization("");
                    setLatitude(""); setLongitude("");
                  } else {
                    alert("❌ Submission failed: " + data.message);
                  }
                } catch (err) {
                  console.error("Error submitting hospital:", err);
                  alert("❌ Something went wrong");
                }
              }}
            >
              <input type="text" className="w-full border p-2 rounded" placeholder="Hospital Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input type="text" className="w-full border p-2 rounded" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
              <input type="text" className="w-full border p-2 rounded" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
              <input type="text" className="w-full border p-2 rounded" placeholder="Contact Number" value={contact} onChange={(e) => setContact(e.target.value)} required />
              <input type="text" className="w-full border p-2 rounded" placeholder="Specializations (comma-separated)" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required />
              <input type="number" className="w-full border p-2 rounded" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
              <input type="number" className="w-full border p-2 rounded" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />

              <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                ➕ Submit Hospital
              </button>
            </form>
          </div>
        )}


        {/* Manage Beds */}
        {activeTab === "addBeds" && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold text-center mb-4">➕ Add Bed</h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const token = localStorage.getItem("token");

                const formWithQuantity = {
                  ...bedForm,
                  quantity: parseInt(quantity), // ✅ add quantity manually
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
                    alert("✅ Bed added successfully");
                    setBedForm({
                      hospital_id: "",
                      bed_type: "",
                      quantity: "",
                      is_available: true,
                      price_per_day: "",
                    });
                    setQuantity(""); // ✅ clear quantity input
                  } else {
                    alert(data.message || "❌ Failed to add bed");
                  }
                } catch (err) {
                  console.error("Error submitting bed:", err);
                }
              }}
              className="space-y-4"
            >

              {/* Hospital Select */}
              <select
                className="w-full p-2 border rounded"
                value={bedForm.hospital_id}
                onChange={(e) =>
                  setBedForm({ ...bedForm, hospital_id: e.target.value })
                }
                required
              >
                <option value="">Select Approved Hospital</option>
                {approvedHospitals.map((hospital) => (
                  <option key={hospital._id} value={hospital._id}>
                    {hospital.name}
                  </option>
                ))}
              </select>

              {/* Bed Type */}
              <select
                className="w-full p-2 border rounded"
                value={bedForm.bed_type}
                onChange={(e) =>
                  setBedForm({ ...bedForm, bed_type: e.target.value })
                }
                required
              >
                <option value="">Select Bed Type</option>
                <option value="general">General</option>
                <option value="icu">ICU</option>
                <option value="ventilator">Ventilator</option>
                <option value="deluxe">Deluxe</option>
              </select>
              {/* Quantity */}
              <input
                type="number"
                placeholder="Number of Beds"
                className="w-full p-2 border rounded"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                 
              />



              {/* Price */}
              <input
                type="number"
                placeholder="Price per day"
                className="w-full p-2 border rounded"
                value={bedForm.price_per_day}
                onChange={(e) =>
                  setBedForm({ ...bedForm, price_per_day: e.target.value })
                }
                required
              />

              {/* Availability Checkbox */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={bedForm.is_available}
                  onChange={(e) =>
                    setBedForm({ ...bedForm, is_available: e.target.checked })
                  }
                />
                Available
              </label>

              <button
                type="submit"
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
              >
                Add Bed
              </button>
            </form>
          </div>
        )}

        {/* Manage Bookings */}

        {activeTab === "manageBookings" && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4 text-center">📋 Pending Bed Bookings</h2>

            {pendingBookings.length === 0 ? (
              <p className="text-gray-600 text-center">No pending bookings</p>
            ) : (
              <table className="w-full table-auto border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border">User</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Hospital</th>
                    <th className="p-2 border">Disease</th>
                    <th className="p-2 border">Bed Type</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBookings.map((booking) => (
                    <tr key={booking._id} className="text-center">
                      <td className="p-2 border">{booking.user.fullName}</td>
                      <td className="p-2 border">{booking.user.email}</td>
                      <td className="p-2 border">{booking.hospital.name}</td>
                      <td className="p-2 border">{booking.disease}</td>
                      <td className="p-2 border capitalize">{booking.bed_type}</td>
                      <td className="p-2 border capitalize">{booking.status}</td>
                      <td className="p-2 border space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(booking._id, "confirmed")}
                          className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          ✅ Confirm
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking._id, "rejected")}
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          ❌ Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}



        {/* add ambulance */} 
        {activeTab === "addAmbulance" && (
          <div>
            <h2 className="text-xl font-bold text-purple-700 mb-4">🚑 Add New Ambulance</h2>
            <form
              onSubmit={handleAddAmbulance}
              className="bg-white p-4 rounded shadow max-w-md space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold">Select Hospital</label>
                <select
                  name="hospital_id"
                  value={formData.hospital_id}
                  onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">-- Select --</option>
                  {verifiedHospitals.map((hosp) => (
                    <option key={hosp._id} value={hosp._id}>
                      {hosp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold">Ambulance Type</label>
                <select
                  name="ambulance_type"
                  value={formData.ambulance_type}
                  onChange={(e) => setFormData({ ...formData, ambulance_type: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="basic">Basic</option>
                  <option value="icu">ICU</option>
                  <option value="ac">AC</option>
                  <option value="non-ac">Non-AC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold">Vehicle Number</label>
                <input
                  type="text"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">Price Per KM (₹)</label>
                <input
                  type="number"
                  value={formData.price_per_km}
                  onChange={(e) => setFormData({ ...formData, price_per_km: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                  min={1}
                />
              </div>

              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
              >
                ➕ Add Ambulance
              </button>
            </form>
          </div>
        )}

        {/* Manage Ambulances */}
        {activeTab === "manageAmbulances" && (
          <div className="p-4">
            <h2 className="text-xl font-bold text-purple-700 mb-4">🚨 Pending Ambulance Requests</h2>

            {ambulanceRequests.length === 0 ? (
              <p className="text-sm text-gray-500">No pending requests.</p>
            ) : (
              <ul className="space-y-4">
                {ambulanceRequests.map((req) => (
                  <li key={req._id} className="p-4 border rounded bg-gray-50 shadow-sm">
                    <p><strong>👤 User:</strong> {req.user.fullName} ({req.user.email})</p>
                    <p><strong>🏥 Hospital:</strong> {req.hospital.name}</p>
                    <p><strong>🚑 Ambulance:</strong> {req.ambulance.ambulance_type} - {req.ambulance.vehicle_number}</p>
                    <p><strong>📍 Pickup:</strong> {req.pickup_location}</p>
                    <p><strong>📍 Drop:</strong> {req.drop_location}</p>

                    <div className="mt-2 flex gap-4">
                      <button
                        onClick={() => handleUpdateAmbulanceStatus(req._id, "confirmed")}
                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition text-sm"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleUpdateAmbulanceStatus(req._id, "rejected")}
                        className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition text-sm"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default OperatorDashboard;
