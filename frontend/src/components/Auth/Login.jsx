import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.open("http://localhost:4000/api/v1/auth/google", "_self");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("All fields are required.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.status === 403 && data.message === "Email not verified") {
        // Redirect to email verification page
        navigate("/verify-email", { state: { email } });
        return;
      }

      if (!res.ok || !data.user) {
      setErrorMsg(data.message || "Login failed");
      return;
      }

      // 🎯 Redirect based on role
      const userRole = data.user?.role;
      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else if (userRole === "operator") {
        navigate("/operator/dashboard");
      } else {
        navigate("/user/dashboard");
      }

    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Login</h2>

        {errorMsg && (
          <div className="text-red-500 text-sm text-center mb-4">{errorMsg}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <div className="my-4 flex items-center justify-center text-sm text-gray-600">or</div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
        >
          <FcGoogle className="text-xl" />
          <span>Sign in with Google</span>
        </button>

        <p className="mt-4 text-center text-sm text-gray-700">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
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
