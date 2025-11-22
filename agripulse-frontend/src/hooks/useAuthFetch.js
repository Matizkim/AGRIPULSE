import { useAuth } from "@clerk/clerk-react";
import API from "../api/axiosInstance";

/**
 * useAuthFetch - hook returning helper to call protected backend endpoints
 * Usage:
 * const authFetch = useAuthFetch();
 * await authFetch.post('/produce', data);
 */
export default function useAuthFetch() {
  const { getToken } = useAuth(); // ✅ updated

  const fetcher = {
    get: async (url, opts = {}) => {
      const token = await getToken({ template: "standard" }); // get auth token
      return API.get(url, {
        ...opts,
        headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` },
      });
    },
    post: async (url, data, opts = {}) => {
      const token = await getToken({ template: "standard" });
      return API.post(url, data, {
        ...opts,
        headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` },
      });
    },
    put: async (url, data, opts = {}) => {
      const token = await getToken({ template: "standard" });
      return API.put(url, data, {
        ...opts,
        headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` },
      });
    },
    del: async (url, opts = {}) => {
      const token = await getToken({ template: "standard" });
      return API.delete(url, {
        ...opts,
        headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` },
      });
    },
  };

  return fetcher;
}
