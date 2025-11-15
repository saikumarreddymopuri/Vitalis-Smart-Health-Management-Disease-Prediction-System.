import React, { useState, useEffect, useContext } from "react";
import { FcGoogle } from "react-icons/fc";
import API from "../../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { TbHexagonLetterV } from "react-icons/tb";
import { UserContext } from "../../context/UserContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    console.log("🚀 Login component mounted");
  }, []);

  const handleGoogleLogin = () => {
    window.open(`${import.meta.env.VITE_API_URL}/api/v1/auth/google`, "_self");
  };

  const handleLogin = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    setErrorMsg("All fields are required.");
    return;
  }

  setIsLoading(true);
  setErrorMsg("");

  try {
    // Successful login (200)
    const res = await API.post("/api/v1/users/login", {
      email,
      password,
    });

    const data = res.data;

    const user = data.data.user;
    const token = data.data.token;

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    setUser(user);

    // Redirect based on role
    if (user.role.toLowerCase() === "admin") return navigate("/admin-dashboard");
    if (user.role.toLowerCase() === "operator") return navigate("/operator-dashboard");
    return navigate("/user-dashboard");

  } catch (err) {
    console.error("❌ Login error:", err);

    const status = err.response?.status;
    const msg = err.response?.data?.message;

    // ⭐ HANDLE EMAIL NOT VERIFIED
    if (status === 403 && msg === "Email not verified") {
      return navigate("/verify-email", { state: { email } });
    }

    setErrorMsg(msg || "An error occurred. Please try again.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full opacity-10 blur-3xl animate-pulse animation-delay-4000"></div>

      <div className="relative z-10 bg-gray-900/60 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-blue-500/30">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-blue-600/20 rounded-full border-2 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <TbHexagonLetterV className="text-5xl text-cyan-300" />
          </div>
          <h1 className="text-4xl font-bold text-white text-center mt-4">
            VITALIS
          </h1>
          <p className="text-lg text-blue-300">Smart Health Management</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-sm text-center p-3 rounded-lg mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-all
                        shadow-[0_0_15px_rgba(59,130,246,0.6)] hover:shadow-[0_0_25px_rgba(59,130,246,0.9)]
                        disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div className="my-5 flex items-center justify-center">
          <div className="h-px bg-gray-700 flex-grow"></div>
          <div className="px-3 text-sm text-gray-500">or</div>
          <div className="h-px bg-gray-700 flex-grow"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-gray-200 rounded-lg hover:bg-white/20 transition-all"
        >
          <FcGoogle className="text-xl" />
          <span>Sign in with Google</span>
        </button>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
