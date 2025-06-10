import React from "react";
import { useLocation } from "react-router-dom";

const VerifyEmail = () => {
  const { state } = useLocation();
  const email = state?.email;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-100">
      <div className="bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-700">Email Not Verified</h2>
        <p className="mt-4 text-gray-600">
          We sent a verification link to <strong>{email}</strong>. <br />
          Please check your inbox and verify your email to continue.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
