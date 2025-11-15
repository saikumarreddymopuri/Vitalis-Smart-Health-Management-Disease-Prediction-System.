import API from "../../utils/api";

import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext.jsx";

const GoogleSuccess = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await API.get("/api/v1/users/me", {
        withCredentials: true,  // ⭐ REQUIRED
      });

      const user = res.data.data.user;

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        const role = user.role.toLowerCase();
        navigate(`/${role}-dashboard`);
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Failed to fetch user after Google login:", err);
      navigate("/login");
    }
  };

  fetchUser();
}, []);


  return <p className="text-center mt-10">Logging you in via Google...</p>;
};

export default GoogleSuccess;
