import React, { useState } from "react";
import Header from "../components/Layout/Header.jsx";
import Sidebar from "../components/Layout/Sidebar.jsx";
import Footer from "../components/Layout/Footer.jsx";

const AdminDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("");

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
