import API from "./axiosInstance";

export const createMatch = async (payload) => {
  const res = await API.post("/match", payload);
  return res.data;
};

export const fetchMatches = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = queryParams ? `/match?${queryParams}` : "/match";
  const res = await API.get(url);
  return res.data;
};

export const getMatch = async (matchId) => {
  const res = await API.get(`/match/${matchId}`);
  return res.data;
};

export const acceptMatch = async (matchId, message) => {
  const res = await API.post(`/match/${matchId}/accept`, { message });
  return res.data;
};

export const cancelMatch = async (matchId, reason) => {
  const res = await API.post(`/match/${matchId}/cancel`, { reason });
  return res.data;
};

export const assignDriver = async (matchId, driverId, transportDetails) => {
  const res = await API.post(`/match/${matchId}/assign-driver`, {
    driverId,
    transportDetails
  });
  return res.data;
};

export const completeMatch = async (matchId, message) => {
  const res = await API.post(`/match/${matchId}/complete`, { message });
  return res.data;
};
