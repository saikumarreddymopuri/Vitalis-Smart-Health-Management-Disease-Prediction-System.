import React, { useState } from "react";
import Header from "../components/Layout/Header.jsx";
import Sidebar from "../components/Layout/Sidebar.jsx";
import Footer from "../components/Layout/Footer.jsx";

const OperatorDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("");

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

        {/* Manage Beds */}
        {activeTab === "manageBeds" && (
          <div className="bg-white p-6 rounded shadow text-center">
            <h2 className="text-xl font-bold mb-4">Manage Beds</h2>
            <p>🛏️ Bed availability tools will be integrated here soon...</p>
          </div>
        )}

        {/* Manage Transport */}
        {activeTab === "manageTransport" && (
          <div className="bg-white p-6 rounded shadow text-center">
            <h2 className="text-xl font-bold mb-4">Manage Transport</h2>
            <p>🚑 Ambulance and transport request handling coming soon...</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OperatorDashboard;
