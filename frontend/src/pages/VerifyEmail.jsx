import React from "react";
import { useLocation, Link } from "react-router-dom";

// --- NEW: A futuristic Mail icon ---
const MailIcon = () => (
  <svg
    className="w-24 h-24 text-cyan-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M12 12.5l-6.75 4.5M12 12.5l6.75 4.5"
    />
    {/* --- NEW: Added a "sent" arrow for effect --- */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      className="text-fuchsia-500"
      d="M17 13l-5-5-5 5"
    />
  </svg>
);

const VerifyEmail = () => {
  const { state } = useLocation();
  const email = state?.email || "your email address"; // Fallback text

  return (
    // --- NEW: Full-screen futuristic background (same as login) ---
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 relative overflow-hidden">
      
      {/* --- NEW: Glowing background shapes --- */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-fuchsia-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl animate-pulse animation-delay-4000"></div>

      {/* --- NEW: Glassmorphic Card with Neon Border (Blue + Pink/Fuchsia) --- */}
      <div className="relative z-10 bg-gray-900/60 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-lg border border-blue-500/30 text-center">
        
        {/* --- NEW: Icon and Title --- */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-4 bg-fuchsia-600/20 rounded-full border-2 border-fuchsia-500/50 shadow-[0_0_25px_rgba(217,70,239,0.5)]">
            <MailIcon />
          </div>
          
          {/* --- NEW: Title with Cyber Pink as requested --- */}
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 mt-6">
            Please Verify Your Email
          </h2>
        </div>

        {/* --- NEW: Styled Message --- */}
        <p className="mt-4 text-gray-300 text-lg">
          We sent a verification link to
          <br />
          {/* --- NEW: Styled Email with Cyber Pink --- */}
          <strong className="text-xl text-fuchsia-400 font-medium">{email}</strong>
        </p>
        
        <p className="mt-6 text-gray-400">
          Please check your inbox (and spam folder) and click the link to
          activate your **VITALIS** account.
        </p>

        {/* --- NEW: Link back to Login --- */}
        <div className="mt-8">
          <Link 
            to="/" 
            className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
          >
            &larr; Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyEmail;