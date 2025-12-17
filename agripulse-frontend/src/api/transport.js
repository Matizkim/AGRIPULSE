import API from "./axiosInstance";

export const createTransport = async (payload) => {
  const res = await API.post("/transport", payload);
  return res.data;
};

export const fetchTransport = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = queryParams 
    ? `/transport?${queryParams}` 
    : "/transport";
  const res = await API.get(url);
  return res.data;
};

export const getDriverTransport = async (driverId) => {
  const res = await API.get(`/transport/driver/${driverId}`);
  return res.data;
};

export const updateTransport = async (transportId, updates) => {
  const res = await API.put(`/transport/${transportId}`, updates);
  return res.data;
};

export const deleteTransport = async (transportId) => {
  const res = await API.delete(`/transport/${transportId}`);
  return res.data;
};

export const getSuggestedDrivers = async (matchId) => {
  const res = await API.get(`/transport/suggest/${matchId}`);
  return res.data;
};

export const incrementTransportViews = async (transportId) => {
  const res = await API.post(`/transport/${transportId}/views`);
  return res.data;
};

