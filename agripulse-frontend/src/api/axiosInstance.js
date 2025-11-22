import axios from "axios";

const baseApi = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: baseApi,
  headers: { "Content-Type": "application/json" },
});

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
