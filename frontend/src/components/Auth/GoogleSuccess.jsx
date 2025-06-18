
import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext.jsx";

const GoogleSuccess = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/v1/users/me", {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok && data?.data?.user) {
          localStorage.setItem("user", JSON.stringify(data.data.user));
          setUser(data.data.user);

          // Redirect to role-based dashboard
          const role = data.data.user.role.toLowerCase();
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
