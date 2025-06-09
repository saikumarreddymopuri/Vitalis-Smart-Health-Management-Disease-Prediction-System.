import React from 'react';

const Login = () => {
  const handleGoogleLogin = () => {
    window.open("http://localhost:4000/api/v1/auth/google", "_self");
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <button
        onClick={handleGoogleLogin}
        className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
