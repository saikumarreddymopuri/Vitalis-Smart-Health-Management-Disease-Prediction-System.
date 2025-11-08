import React from "react";

const Sidebar = ({ isOpen, toggleSidebar, setActiveTab, role }) => {
  const roleMenus = {
    User: [
      { label: "Profile", tab: "profile" },
      { label: "Know Disease", tab: "know" },
      { label: "Bed Booking", tab: "bookBed" },
      { label: "Transport Booking", tab: "bookAmbulance" },
      { label: "History", tab: "history" },
    ],
    Operator: [
      { label: "Profile", tab: "profile" },
      { label: "🏥 Add Hospital", tab: "addHospital" },
      { label: "Add Beds", tab: "addBeds" },
      { label: "Manage Bookings", tab: "manageBookings" },
      { label: "🚑 Add Ambulance", tab: "addAmbulance" },
      { label: "Manage Ambulances Bookings", tab: "manageAmbulances" },
    ],
    Admin: [
      { label: "Profile", tab: "profile" },
      { label: "Pending Requests", tab: "pending" },
      { label: "👥 Manage Customers", tab: "manageCustomers" },
      { label: "🛠️ Manage Operators", tab: "manageOperators" },
      { label: "System Analytics", tab: "analytics" },
    ],
  };

  const links = roleMenus[role] || [];

  return (
    <aside
  className={`fixed top-0 left-0 h-full w-64 bg-blue-800 text-white transform ${
    isOpen ? "translate-x-0" : "-translate-x-full"
  } transition-transform duration-300 z-40 shadow-lg`}
>
  <div className="bg-gray-800 dark:bg-gray-800 text-white dark:text-white shadow p-4 flex justify-between items-center">
    <h2 className="text-xl font-bold">Dashboard</h2>
    <button
      className="text-black dark:text-white focus:outline-none"
      onClick={toggleSidebar}
    >
      ✖
    </button>
  </div>

  <nav className="mt-4 space-y-2 px-4">
    {links.map((item) => (
      <button
        key={item.tab}
        onClick={() => {
          setActiveTab(item.tab);
          setTimeout(() => toggleSidebar(), 100);
        }}
        className="block w-full text-left py-2 px-3 rounded hover:bg-blue-600 transition-all duration-200"
      >
        {item.label}
      </button>
    ))}
  </nav>
</aside>

  );
};

export default Sidebar;
