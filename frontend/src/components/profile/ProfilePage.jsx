// pages/Profile.jsx
import React, { useState } from "react";
import Header from "../Layout/Header.jsx";
import Sidebar from "../Layout/Sidebar.jsx";

const Profile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [formData, setFormData] = useState({ ...storedUser });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    console.log("Update user to backend", formData);
    // TODO: call update API and update localStorage
  };

  return (
    <>
      <Header toggleSidebar={() => setIsOpen(!isOpen)} avatarUrl={formData.avatar} name={formData.fullName} />
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} role={formData.role} />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
        <div className="space-y-4 max-w-md">
          <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="w-full p-2 border rounded" />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full p-2 border rounded" />
          <input name="email" value={formData.email} readOnly className="w-full p-2 border rounded bg-gray-100" />
          <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded">Update Profile</button>
        </div>
      </div>
    </>
  );
};

export default Profile;
