import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Auth/Login.jsx";
import Register from "./components/Auth/Register.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
// import UserDashboard from "./pages/UserDashboard.jsx";
// import AdminDashboard from "./pages/AdminDashboard.jsx";
// import OperatorDashboard from "./pages/OperatorDashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        {/* <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/operator/dashboard" element={<OperatorDashboard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
