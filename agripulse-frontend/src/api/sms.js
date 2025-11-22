import API from "./axiosInstance";

export const fetchMatches = async () => {
  const res = await API.get("/match");
  return res.data;
};
