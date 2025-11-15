import React, { useState, useEffect } from "react";
import API from "../../utils/api";
import ReactDOM from "react-dom"; // --- 1. IMPORT REACTDOM (for the modal) ---
import { toast } from "react-hot-toast";
// --- 2. IMPORT NEW ICONS ---
import {
  HiOutlineUsers,
  HiPencilAlt,
  HiOutlineX,
  HiOutlineTrash,
  HiOutlineExclamation,
  HiCheck,
  HiOutlineArrowLeft,
} from "react-icons/hi";

const UserManagementPanel = ({ roleToManage, token }) => {
  const [listData, setListData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // For loading spinner on save

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const endpoint =
        roleToManage === "User" ? "admin/users" : "admin/operators";
      try {
        const res = await API.get(`/api/v1/users/${endpoint}`);
        setListData(res.data.data || []);

      } catch (err) {
        setError(err.message);
        toast.error(`Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roleToManage, token]);

  // --- Modal Handlers ---
  const handleViewEdit = (user) => {
    setSelectedUser(user);
    setEditFormData({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phone: user.phone,
    });
    setIsModalOpen(true);
    setIsDeleting(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setEditFormData({
      fullName: "",
      username: "",
      email: "",
      phone: "",
    });
  };

  const handleFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  // --- API Handlers ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsUpdating(true); // Start loading

    try {
      const res = await API.patch(
        `/api/v1/users/admin/user/${selectedUser._id}`,
        editFormData
      );

      setListData(
        listData.map((user) =>
          user._id === selectedUser._id ? res.data.data : user
        )
      );

      toast.success(`${roleToManage} updated successfully!`);
      handleModalClose();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false); // Stop loading
    }
  };

  const handleDelete = async () => {
    if (!selectedUser || !isDeleting) return;

    try {
      await API.delete(`/api/v1/users/admin/user/${selectedUser._id}`);

      setListData(listData.filter((u) => u._id !== selectedUser._id));
      toast.success(`${roleToManage} deleted successfully!`);
      handleModalClose();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  // --- NEW: Modal Component (now styled) ---
  const EditModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-full max-w-lg border border-blue-500/30">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
            Edit {roleToManage}: {selectedUser.fullName}
          </h3>
          <button
            onClick={handleModalClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-700/50 hover:text-white"
          >
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* Edit Form */}
        {!isDeleting ? (
          <form onSubmit={handleUpdate}>
            <div className="space-y-4">
              {/* Form Fields */}
              <div>
                <label className="block text-sm font-medium mb-1 text-cyan-400" htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={editFormData.fullName}
                  onChange={handleFormChange}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-cyan-400" htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={editFormData.username}
                  onChange={handleFormChange}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-cyan-400" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleFormChange}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-cyan-400" htmlFor="phone">Phone</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleFormChange}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setIsDeleting(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-red-500/70 bg-red-600/30 text-red-300 
                           font-medium hover:bg-red-600/60 hover:text-white transition duration-200 
                           shadow-[0_0_10px_rgba(239,68,68,0.4)]"
              >
                <HiOutlineTrash />
                Delete {roleToManage}
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-green-600 text-white 
                           font-medium hover:bg-green-500 transition duration-200 
                           shadow-[0_0_15px_rgba(34,197,94,0.6)] disabled:opacity-50"
              >
                <HiCheck />
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          // Delete Confirmation
          <div className="w-full text-center p-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-600/20 border border-red-500/50">
                <HiOutlineExclamation className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <p className="text-xl font-semibold mb-3 text-white">Are you absolutely sure?</p>
            <p className="text-gray-400 mb-6">This action cannot be undone. This will permanently delete the {roleToManage}.</p>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={handleDelete}
                className="w-full px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-medium transition-all
                           shadow-[0_0_15px_rgba(239,68,68,0.6)] hover:shadow-[0_0_25px_rgba(239,68,68,0.9)]"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setIsDeleting(false)}
                className="w-full px-6 py-2 rounded-lg bg-gray-700/50 border border-gray-600 hover:bg-gray-700/80 font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // --- Render ---
  if (isLoading) {
    return (
      <div className="text-center p-10 text-cyan-400">
        <p>Loading {roleToManage}s...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    // --- NEW: Glassmorphic main card ---
    <div className="bg-gray-900/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-blue-500/30">
      
      {/* --- NEW: Gradient Title --- */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <HiOutlineUsers className="w-8 h-8 text-cyan-400" />
        <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
          Manage {roleToManage}s ({listData.length})
        </h2>
      </div>
      
      {/* --- NEW: Styled List Table --- */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-lg rounded-lg shadow-lg overflow-hidden">
          <thead className="bg-gray-900/70 border-b border-blue-500/30">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-cyan-400 uppercase tracking-wider">Avatar</th>
              <th className="p-3 text-left text-sm font-semibold text-cyan-400 uppercase tracking-wider">Name</th>
              <th className="p-3 text-left text-sm font-semibold text-cyan-400 uppercase tracking-wider">Email</th>
              <th className="p-3 text-left text-sm font-semibold text-cyan-400 uppercase tracking-wider">Phone</th>
              <th className="p-3 text-left text-sm font-semibold text-cyan-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {listData.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-400">
                  No {roleToManage}s found.
                </td>
              </tr>
            ) : (
              listData.map((user) => (
                <tr key={user._id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="p-3">
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-fuchsia-500/50"
                    />
                  </td>
                  <td className="p-3 font-medium text-white">{user.fullName}</td>
                  <td className="p-3 text-gray-300">{user.email}</td>
                  <td className="p-3 text-gray-300">{user.phone}</td>
                  <td className="p-3">
                    {/* --- NEW: Styled Button --- */}
                    <button
                      onClick={() => handleViewEdit(user)}
                      className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-blue-500/70 bg-blue-600/30 text-blue-300 
                                 font-medium hover:bg-blue-600/60 hover:text-white transition duration-200 
                                 shadow-md hover:shadow-blue-500/50"
                    >
                      <HiPencilAlt />
                      View / Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- NEW: Modal is now rendered using a Portal --- */}
      {isModalOpen && selectedUser && ReactDOM.createPortal(
        <EditModal />,
        document.getElementById("modal-root") // We use the portal
      )}
    </div>
  );
};

export default UserManagementPanel;