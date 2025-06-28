import React, { useState } from "react";
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
