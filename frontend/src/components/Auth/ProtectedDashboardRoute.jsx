import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext.jsx";
import AdminDashboard from "../../pages/AdminDashboard.jsx";
import OperatorDashboard from "../../pages/OperatorDashboard.jsx";
import UserDashboard from "../../pages/UserDashboard.jsx";

const ProtectedDashboardRoute = () => {
  const { user } = useContext(UserContext);

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

export default ProtectedDashboardRoute;
