import axios from "axios";

// Use environment variable or fallback to default
const baseApi = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: baseApi,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor to add Clerk token
API.interceptors.request.use(
  async (config) => {
    try {
      const { getClerkToken } = await import("../utils/getClerkToken");
      const token = await getClerkToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // Token not available, continue without it
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      err.message = "Network error or server unreachable";
    }
    return Promise.reject(err);
  }
);

export default API;