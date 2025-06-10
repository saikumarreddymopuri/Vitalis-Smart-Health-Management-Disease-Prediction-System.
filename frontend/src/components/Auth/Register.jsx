import React, { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // to display success or error messages

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!avatar) {
      setMessage({ type: "error", text: "Please upload an avatar" });
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    data.append("avatar", avatar);

    try {
      setLoading(true);
      setMessage(null);
      const response = await fetch("http://localhost:4000/api/v1/users/register", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        setMessage({ type: "success", text: result.message || "Registered successfully!" });
      } else {
        setMessage({ type: "error", text: result.message || "Registration failed!" });
      }
    } catch (error) {
      setLoading(false);
      setMessage({ type: "error", text: "Something went wrong!" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-5"
      >
        <h2 className="text-2xl font-bold text-center text-blue-700">Register</h2>

        <input
          name="fullName"
          type="text"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          name="username"
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          name="phone"
          type="text"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="user">User</option>
          <option value="operator">Operator</option>
          <option value="admin">Admin</option>
        </select>

        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="block"
          />
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="Preview"
              className="w-12 h-12 rounded-full object-cover border"
            />
          )}
        </div>

        {/* Loader */}
        {loading && (
          <div className="text-center text-blue-600 font-medium">
            <svg
              className="animate-spin inline w-5 h-5 mr-2 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            Processing registration...
          </div>
        )}

        {/* Success or Error Message */}
        {message && (
          <div
            className={`text-center text-sm font-semibold ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          Register
        </button>

        <p className="text-center text-sm mt-2">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-700 hover:underline font-semibold">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
