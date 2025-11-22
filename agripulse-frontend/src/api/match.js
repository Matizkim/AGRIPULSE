import API from "./axiosInstance";

export const createMatch = async (payload) => {
  const res = await API.post("/match", payload);
  return res.data;
};

export const fetchMatches = async () => {
  const res = await API.get("/match");
  return res.data;
};
