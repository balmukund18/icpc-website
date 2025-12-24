import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const api = axios.create({
  baseURL: "http://localhost:5001/api", // Adjust if backend runs on a different port
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
