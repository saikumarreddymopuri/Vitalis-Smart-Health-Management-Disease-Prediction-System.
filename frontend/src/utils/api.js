import axios from "axios";

// Automatically pick correct backend URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,   // do not hardcode
  withCredentials: true,                  // allow cookies/JWT from backend
});

// Optional: automatic token attaching (if you use JWT in headers)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
