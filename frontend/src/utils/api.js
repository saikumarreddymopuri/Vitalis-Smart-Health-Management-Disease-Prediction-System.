import axios from "axios";

const API = axios.create({
  baseURL: "https://vitalis-api.vercel.app",
  withCredentials: true,
});

export default API;
