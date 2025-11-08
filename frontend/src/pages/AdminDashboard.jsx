import React, { useState, useEffect } from "react";
import Header from "../components/Layout/Header.jsx";
import Sidebar from "../components/Layout/Sidebar.jsx";
import Footer from "../components/Layout/Footer.jsx";
// --- NEW IMPORT ---
import UserManagementPanel from "../components/Admin/UserManagementPanel.jsx";

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
            <img
              src={user.avatar}
              alt="User Avatar"
              className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg mb-4"
            />
            <h1 className="text-3xl font-bold text-blue-700 mb-2">
              Welcome to MediConnect 👋
            </h1>
            <p className="text-gray-700 dark:text-gray-300">
              Manage and monitor the system effectively
            </p>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded-xl shadow-md max-w-xl mx-auto transition-all duration-300">
            <h2 className="text-2xl font-bold text-center text-blue-700 dark:text-blue-400 mb-6">
              👤 Your Profile
            </h2>

            <div className="space-y-4 text-gray-700 dark:text-gray-200">
              <div className="flex justify-between border-b border-gray-300 dark:border-gray-600 pb-2">
                <span className="font-medium">Name:</span>
                <span>{user.fullName}</span>
              </div>

              <div className="flex justify-between border-b border-gray-300 dark:border-gray-600 pb-2">
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>

              <div className="flex justify-between pb-2">
                <span className="font-medium">Role:</span>
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "pending" && (
          <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">
              Pending Hospital Requests
            </h2>

            {pendingHospitals.length === 0 ? (
              <p className="text-center text-gray-700 dark:text-gray-300">
                No pending requests 🎉
              </p>
            ) : (
              <ul className="space-y-4">
                {pendingHospitals.map((hospital) => (
                  <li key={hospital._id} className="border p-4 rounded shadow">
                    <h3 className="font-bold text-lg">{hospital.name}</h3>
                    <p>
                      <strong>City:</strong> {hospital.city}
                    </p>
                    <p>
                      <strong>Contact:</strong> {hospital.contact_number}
                    </p>
                    <p>
                      <strong>Specialization:</strong>{" "}
                      {hospital.specialization_offered}
                    </p>

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
        {/* --- END NEW SECTIONS --- */}

        {/* --- OLD "users" tab is removed, but we keep analytics --- */}
        {activeTab === "analytics" && (
          <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded shadow text-center">
            <h2 className="text-xl font-bold">System Analytics</h2>
            <p>📊 Reports and analytics coming soon...</p>
          </div>
        )}
      </main>

      <Footer isOpen={isOpen} />
    </div>
  );
};

export default AdminDashboard;