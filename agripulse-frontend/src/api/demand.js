import API from "./axiosInstance";

export const fetchDemands = async (query = {}) => {
  const params = new URLSearchParams(query).toString();
  const url = params ? `/demand?${params}` : "/demand";
  const res = await API.get(url);
  return res.data;
};
