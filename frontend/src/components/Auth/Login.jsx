import React, { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
// --- NEW: Added an icon for the futuristic feel ---
import { TbHexagonLetterV } from "react-icons/tb";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false); // --- NEW: Added loading state ---

  const navigate = useNavigate();

  // Just to verify component is rendering
  useEffect(() => {
    console.log("🚀 Login component mounted");
  }, []);

  const handleGoogleLogin = () => {
    window.open("http://localhost:4000/api/v1/auth/google", "_self");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("🧠 handleLogin called");

    if (!email || !password) {
      setErrorMsg("All fields are required.");
      return;
    }

    setIsLoading(true); // --- Start loading ---
    setErrorMsg(""); // --- Clear old errors ---

    try {
      const res = await fetch("http://localhost:4000/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.status === 403 && data.message === "Email not verified") {
        navigate("/verify-email", { state: { email } });
        return;
      }

      if (!res.ok || !data.data?.user) {
        setErrorMsg(data.message || "Login failed. Please check credentials.");
        return;
      }

      console.log("✅ Login successful. Setting user:", data.data?.user);

      // after login and getting user from backend
      const user = data.data.user;
      const token = data.data.token;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      if (user.role === "Admin") {
        navigate("/admin-dashboard");
      } else if (user.role === "Operator") {
        navigate("/operator-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setIsLoading(false); // --- Stop loading ---
    }
  };

  return (
    // --- NEW: Full-screen futuristic background ---
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 relative overflow-hidden">
      
      {/* --- NEW: Glowing background shapes for effect --- */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full opacity-10 blur-3xl animate-pulse animation-delay-4000"></div>

      {/* --- NEW: Glassmorphic Card with Neon Border --- */}
      <div className="relative z-10 bg-gray-900/60 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-blue-500/30">
        
        {/* --- NEW: Title Section --- */}
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
          // --- NEW: Styled Error Message ---
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-sm text-center p-3 rounded-lg mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* --- NEW: Styled Inputs --- */}
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

          {/* --- NEW: Styled Login Button with Glow --- */}
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
        
        {/* --- NEW: Styled Google Button --- */}
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


































































// import React, { useState } from "react";
// import { FcGoogle } from "react-icons/fc";
// import { Link } from "react-router-dom";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errorMsg, setErrorMsg] = useState("");

//   const handleGoogleLogin = () => {
//     window.open("http://localhost:4000/api/v1/auth/google", "_self");
//   };

//   const handleLogin = (e) => {
//     e.preventDefault();
//     // TODO: Add manual login logic here
//     if (!email || !password) {
//       setErrorMsg("All fields are required.");
//     } else {
//       // Login API Call
//       console.log("Logging in with:", email, password);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-4">
//       <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
//         <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Login</h2>

//         {errorMsg && (
//           <div className="text-red-500 text-sm text-center mb-4">{errorMsg}</div>
//         )}

//         <form onSubmit={handleLogin} className="space-y-4">
//           <input
//             type="email"
//             placeholder="Email"
//             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />

//           <button
//             type="submit"
//             className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//           >
//             Login
//           </button>
//         </form>

//         <div className="my-4 flex items-center justify-center text-sm text-gray-600">or</div>

//         <button
//           onClick={handleGoogleLogin}
//           className="w-full py-3 flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
//         >
//           <FcGoogle className="text-xl" />
//           <span>Sign in with Google</span>
//         </button>

//         <p className="mt-4 text-center text-sm text-gray-700">
//           Don't have an account?{" "}
//           <Link to="/register" className="text-blue-600 hover:underline">
//             Register here
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;
