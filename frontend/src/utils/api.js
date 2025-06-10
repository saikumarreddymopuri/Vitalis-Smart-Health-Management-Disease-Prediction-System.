import axios from "axios";

const API = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

export default API;
