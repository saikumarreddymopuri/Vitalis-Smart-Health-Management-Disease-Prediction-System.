import React, { useState, useEffect } from "react";
import Header from "../components/Layout/Header.jsx";
import Sidebar from "../components/Layout/Sidebar.jsx";
import Footer from "../components/Layout/Footer.jsx";

const AdminDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("");
  const [pendingHospitals, setPendingHospitals] = useState([]);
  const token = localStorage.getItem("token");


  // Fetch pending hospitals
useEffect(() => {
  const fetchPendingHospitals = async () => {
    if (activeTab === "pending") {
      try {
        const res = await fetch("http://localhost:4000/api/hospitals/pending", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setPendingHospitals(data.data || []);
        console.log("📥 Pending hospitals:", data.data);
      } catch (err) {
        console.error("❌ Error fetching pending:", err);
      }
    }
  };

  fetchPendingHospitals();
}, [activeTab]);


const handleApprove = async (id) => {
  try {
    const res = await fetch(`http://localhost:4000/api/hospitals/${id}/verify`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setPendingHospitals((prev) => prev.filter((h) => h._id !== id));
      alert("✅ Approved successfully");
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
      alert("❌ Rejected & removed");
    }
  } catch (err) {
    console.error("❌ Error rejecting:", err);
  }
};


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
        {activeTab === "" && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <img
              src={user.avatar}
              alt="User Avatar"
              className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg mb-4"
            />
            <h1 className="text-3xl font-bold text-blue-700 mb-2">
              Welcome to MediConnect 👋
            </h1>
            <p className="text-gray-600">Manage and monitor the system effectively</p>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold">Your Profile</h2>
            <p><strong>Name:</strong> {user.fullName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        )}


        {activeTab === "pending" && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">Pending Hospital Requests</h2>

            {pendingHospitals.length === 0 ? (
              <p className="text-center text-gray-500">No pending requests 🎉</p>
            ) : (
              <ul className="space-y-4">
                {pendingHospitals.map((hospital) => (
                  <li key={hospital._id} className="border p-4 rounded shadow">
                    <h3 className="font-bold text-lg">{hospital.name}</h3>
                    <p><strong>City:</strong> {hospital.city}</p>
                    <p><strong>Contact:</strong> {hospital.contact_number}</p>
                    <p><strong>Specialization:</strong> {hospital.specialization_offered}</p>

                    <div className="mt-3 flex gap-4">
                      <button
                        onClick={() => handleApprove(hospital._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleReject(hospital._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
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


        {activeTab === "users" && (
          <div className="bg-white p-6 rounded shadow text-center">
            <h2 className="text-xl font-bold">Manage Users</h2>
            <p>👥 User control panel coming soon...</p>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white p-6 rounded shadow text-center">
            <h2 className="text-xl font-bold">System Analytics</h2>
            <p>📊 Reports and analytics coming soon...</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
