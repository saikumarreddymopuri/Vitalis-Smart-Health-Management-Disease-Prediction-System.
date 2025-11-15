import API from "../../utils/api";
import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext.jsx";

const GoogleSuccess = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const finishGoogleLogin = async () => {
      // ⭐ 1. Get token from URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      // ⭐ 2. Save token to localStorage
      if (token) {
        localStorage.setItem("token", token);
      } else {
        console.error("No token found in URL");
        return navigate("/login");
      }

      try {
        // ⭐ 3. Fetch user data using the stored token
        const res = await API.get("/api/v1/users/me", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,   // ⭐ VERY IMPORTANT
          },
        });

        const user = res.data.data.user;

        if (user) {
          // ⭐ 4. Save user and redirect
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

    finishGoogleLogin();
  }, []);

  return <p className="text-center mt-10">Logging you in via Google...</p>;
};

export default GoogleSuccess;
