import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// --- NEW: Added icons for branding and avatar placeholder ---
import { TbHexagonLetterV } from "react-icons/tb";
import { HiUser } from "react-icons/hi";

const Register = () => {
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate(); // --- NEW: Added navigate for redirect ---

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
        setMessage({
          type: "success",
          text: result.message || "Registered successfully! Redirecting to login...",
        });
        // --- NEW: Redirect to login on success ---
        setTimeout(() => {
          navigate("/"); // Redirect to login (assuming "/" is your login route)
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: result.message || "Registration failed!",
        });
      }
    } catch (error) {
      setLoading(false);
      setMessage({ type: "error", text: "Something went wrong!" });
    }
  };

  return (
    // --- NEW: Full-screen futuristic background (same as login) ---
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 relative overflow-hidden">
      
      {/* --- NEW: Glowing background shapes --- */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 rounded-full opacity-10 blur-3xl animate-pulse animation-delay-4000"></div>

      {/* --- NEW: Glassmorphic Card with Neon Border --- */}
      <div className="relative z-10 bg-gray-900/60 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-blue-500/30">
        
        {/* --- NEW: Title Section (same as login) --- */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-blue-600/20 rounded-full border-2 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <TbHexagonLetterV className="text-5xl text-cyan-300" />
          </div>
          <h1 className="text-4xl font-bold text-white text-center mt-4">
            VITALIS
          </h1>
          <p className="text-lg text-blue-300">Create Your Account</p>
        </div>

        {/* --- NEW: Styled Message/Alert Box --- */}
        {message && (
          <div
            className={`text-center text-sm font-medium p-3 rounded-lg mb-4 ${
              message.type === "success"
                ? "bg-green-500/20 border border-green-500/50 text-green-300"
                : "bg-red-500/20 border border-red-500/50 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* --- NEW: Styled Avatar Uploader --- */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-24 h-24 rounded-full bg-gray-800/50 border-2 border-gray-700 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <HiUser className="w-12 h-12 text-gray-500" />
              )}
            </div>
            <label className="cursor-pointer bg-white/10 border border-white/20 text-gray-200 rounded-lg hover:bg-white/20 transition-all px-4 py-2 text-sm font-medium">
              Upload Profile Avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                required
              />
            </label>
          </div>

          {/* --- NEW: Styled Inputs --- */}
          <input
            name="fullName"
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
          <input
            name="phone"
            type="text"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="" className="text-black">Select Role</option>
            <option value="User" className="text-black">User</option>
            <option value="Operator" className="text-black">Operator</option>
            <option value="Admin" className="text-black">Admin</option>
          </select>

          {/* --- NEW: Styled Register Button --- */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-all
                        shadow-[0_0_15px_rgba(59,130,246,0.6)] hover:shadow-[0_0_25px_rgba(59,130,246,0.9)]
                        disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-400">
          Already have an account?{" "}
          <Link to="/" className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
