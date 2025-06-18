import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./context/UserContext";

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
      {/* Redirect root to login */}

      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
