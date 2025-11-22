  import API from "./axiosInstance";

  // Public fetch: browsing produce can be public in other setups, but per Option A we require auth for posting.
  // For list (GET) we'll still call the backend endpoint which may be protected — caller must provide token via useAuthFetch.
  export const fetchProduce = async (query = {}) => {
    const params = new URLSearchParams(query).toString();
    const url = params ? `/produce?${params}` : "/produce";
    const res = await API.get(url);
    return res.data;
  };
