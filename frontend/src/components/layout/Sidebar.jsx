import React from "react";

const Sidebar = ({ isOpen, toggleSidebar, setActiveTab, role }) => {
  console.log("ROLE in Sidebar:", role);
  // Define tab options based on role
  const roleMenus = {
    User: [
      { label: "Profile", tab: "profile" },
      { label: "Know Disease", tab: "know" },
      { label: "Bed Booking", tab: "bed" },
      { label: "Transport Booking", tab: "transport" },
      { label: "History", tab: "history" },
    ],
    Operator: [
      { label: "Profile", tab: "profile" },
      { label: "🏥 Add Hospital", tab: "addHospital" },
      { label: "Manage Beds", tab: "addBeds" },
      { label: "Manage Transport", tab: "manageTransport" },
    ],
    Admin: [
      { label: "Profile", tab: "profile" },
      { label: "Pending Requests", tab: "pending" },
      { label: "Manage Users", tab: "users" },
      { label: "System Analytics", tab: "analytics" },
    ],
  };

  const links = roleMenus[role] || [];

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-blue-800 text-white transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300 z-40 shadow-lg`}
    >
      <div className="p-4 flex justify-between items-center border-b border-blue-500">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <button
          className="text-white md:hidden focus:outline-none"
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
    console.log("Tab clicked:", item.tab);
    setActiveTab(item.tab);
    // Delay closing sidebar slightly to ensure tab state is applied
    setTimeout(() => {
      toggleSidebar();
    }, 100); // 100ms delay
  }}
  className="block w-full text-left py-2 px-3 rounded hover:bg-blue-600 transition-all duration-200 cursor-pointer"
>
  {item.label}
</button>

        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
