import React from "react";
// --- NEW: Added icons for branding and menu items ---
import {
  HiX,
  HiOutlineUserCircle,
  HiOutlineBeaker,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineChartPie,
  HiOutlineCog,
  HiOutlineAdjustments,
  HiOutlineCollection,
  HiOutlineOfficeBuilding,
  HiOutlineUsers,
  HiOutlineArchive,
} from "react-icons/hi";
import { TbHexagonLetterV } from "react-icons/tb";
import { FaBed, FaAmbulance } from "react-icons/fa";

const Sidebar = ({ isOpen, toggleSidebar, setActiveTab, role, activeTab }) => {
  // --- NEW: Added icons to your menu structure ---
  const roleMenus = {
    User: [
      { label: "Profile", tab: "profile", icon: <HiOutlineUserCircle /> },
      { label: "Know Disease", tab: "know", icon: <HiOutlineBeaker /> },
      { label: "Bed Booking", tab: "bookBed", icon: <FaBed /> },
      {
        label: "Transport Booking",
        tab: "bookAmbulance",
        icon: <FaAmbulance />,
      },
      { label: "History", tab: "history", icon: <HiOutlineClipboardList /> },
    ],
    Operator: [
      { label: "Profile", tab: "profile", icon: <HiOutlineUserCircle /> },
      {
        label: "Add Hospital",
        tab: "addHospital",
        icon: <HiOutlineOfficeBuilding />,
      },
      { label: "Add Beds", tab: "addBeds", icon: <FaBed /> },
      {
        label: "Manage Bed Bookings",
        tab: "manageBookings",
        icon: <HiOutlineCollection />,
      },
      { label: "Add Ambulance", tab: "addAmbulance", icon: <FaAmbulance /> },
      {
        label: "Manage Ambulance Bookings",
        tab: "manageAmbulances",
        icon: <HiOutlineAdjustments />,
      },
      {
      label: "Booking History",
      tab: "history",
      icon: <HiOutlineArchive />,
      },
    ],
    Admin: [
      { label: "Profile", tab: "profile", icon: <HiOutlineUserCircle /> },
      {
        label: "Pending Requests",
        tab: "pending",
        icon: <HiOutlineCheckCircle />,
      },
      {
        label: "Manage Customers",
        tab: "manageCustomers",
        icon: <HiOutlineUsers />,
      },
      {
        label: "Manage Operators",
        tab: "manageOperators",
        icon: <HiOutlineCog />,
      },
      // {
      //   label: "System Analytics",
      //   tab: "analytics",
      //   icon: <HiOutlineChartPie />,
      // },
      {
      label: "Hospital History",
      tab: "history",
      icon: <HiOutlineArchive />,
      },
      {
        label: "System Analytics",
        tab: "analytics",
        icon: <HiOutlineChartPie />,
      },
    ],
  };

  const links = roleMenus[role] || [];

  return (
    // --- NEW: Glassmorphic background with neon border ---
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-gray-950/80 backdrop-blur-lg text-gray-200 
                 border-r border-blue-500/30 transform ${
                   isOpen ? "translate-x-0" : "-translate-x-full"
                 } transition-transform duration-300 z-40 shadow-2xl`}
    >
      {/* --- NEW: Header with VITALIS branding --- */}
      <div className="p-4 flex justify-between items-center border-b border-blue-500/30">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-600/20 rounded-full border border-blue-500/50">
            <TbHexagonLetterV className="text-2xl text-cyan-300" />
          </div>
          <h2 className="text-xl font-bold text-white">VITALIS</h2>
        </div>
        
        {/* --- NEW: Styled close button --- */}
        <button
          className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 rounded-full"
          onClick={toggleSidebar}
        >
          <HiX className="w-6 h-6" />
        </button>
      </div>

      {/* --- NEW: Styled Nav Links --- */}
      <nav className="mt-4 space-y-2 px-4">
        {links.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => {
                setActiveTab(item.tab);
                // We don't need the timeout if the sidebar is part of the layout
                // But keeping your original logic:
                setTimeout(() => toggleSidebar(), 100);
              }}
              // --- NEW: Dynamic classes for active/hover states ---
              className={`flex items-center gap-3 w-full text-left py-3 px-3 rounded-lg transition-all duration-200 
                          ${
                            isActive
                              ? "bg-blue-600/50 text-cyan-300 shadow-[0_0_10px_rgba(59,130,246,0.5)] border border-blue-500/50"
                              : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                          }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;