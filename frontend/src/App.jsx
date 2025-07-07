import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./context/UserContext";
import { Toaster } from "react-hot-toast";

import Login from "./components/Auth/Login.jsx";
import Register from "./components/Auth/Register.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import OperatorDashboard from "./pages/OperatorDashboard.jsx";
import Profile from "./components/profile/ProfilePage.jsx";
import ProtectedDashboardRoute from "./components/Auth/ProtectedDashboardRoute.jsx";
import GoogleSuccess from "./components/Auth/GoogleSuccess.jsx";

const App = () => {
  const { user } = useContext(UserContext);
  //console.log("👀 App.jsx User Context:", user);

  const getDashboard = () => {
    if (!user) return <Navigate to="/login" />;
    switch (user.role) {
      case "admin":
        return <AdminDashboard />;
      case "operator":
        return <OperatorDashboard />;
      default:
        return <UserDashboard />;
    }
  };

  return (
  <>
    <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          className: "custom-toast",
          style: {
            background: "#1f2937", // dark gray (Tailwind's gray-800)
            color: "#ffffff",
            fontSize: "1.1rem",
            padding: "1.25rem 1.75rem",
            borderRadius: "8px",
          },
        }}
      />


    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/dashboard" element={<ProtectedDashboardRoute />} />
      <Route path="/dashboard" element={getDashboard()} />
      <Route path="/google-success" element={<GoogleSuccess />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/operator-dashboard" element={<OperatorDashboard />} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  </>
);

};

export default App;
