import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

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

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const endpoint =
        roleToManage === "User" ? "admin/users" : "admin/operators";
      try {
        const res = await fetch(
          `http://localhost:4000/api/v1/users/${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch ${roleToManage}s`);
        }
        const data = await res.json();
        setListData(data.data || []);
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
    setIsDeleting(false); // Reset delete confirmation
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

    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/users/admin/user/${selectedUser._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editFormData),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update");
      }

      // Update list in state
      setListData(
        listData.map((user) =>
          user._id === selectedUser._id ? data.data : user
        )
      );
      toast.success(`${roleToManage} updated successfully!`);
      handleModalClose();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser || !isDeleting) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/users/admin/user/${selectedUser._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete");
      }

      // Remove from list in state
      setListData(listData.filter((user) => user._id !== selectedUser._id));
      toast.success(`${roleToManage} deleted successfully!`);
      handleModalClose();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  // --- Render ---
  if (isLoading) {
    return (
      <div className="text-center p-10">
        <p>Loading {roleToManage}s...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">
        Manage {roleToManage}s ({listData.length})
      </h2>
      
      {/* List Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-lg bg-white dark:bg-gray-900 rounded-lg shadow">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">Avatar</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {listData.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No {roleToManage}s found.
                </td>
              </tr>
            ) : (
              listData.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-3">
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="p-3 font-medium">{user.fullName}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.phone}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleViewEdit(user)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      View / Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details/Edit Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 m-4">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">
                Edit {roleToManage}: {selectedUser.fullName}
              </h3>
              <button
                onClick={handleModalClose}
                className="text-gray-600 dark:text-gray-300 hover:text-red-500 text-3xl"
              >
                &times;
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={editFormData.fullName}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={editFormData.username}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="phone">Phone</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded dark:bg-gray-700"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                
                {/* Save and Delete Buttons */}
                {!isDeleting ? (
                  <>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeleting(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Delete {roleToManage}
                    </button>
                  </>
                ) : (
                  // Delete Confirmation
                  <div className="w-full text-center">
                    <p className="text-lg font-semibold mb-3">Are you sure?</p>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="bg-red-700 text-white px-4 py-2 rounded mr-4 hover:bg-red-800"
                    >
                      Yes, Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeleting(false)}
                      className="bg-gray-300 text-black px-4 py-2 rounded dark:bg-gray-600 dark:text-white hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPanel;