import API from "./axiosInstance";

// Get market demands with filters - V0.8
export const fetchDemands = async (query = {}) => {
  const params = new URLSearchParams();
  
  // Add all query parameters
  Object.keys(query).forEach(key => {
    if (query[key] !== undefined && query[key] !== null && query[key] !== "") {
      params.append(key, query[key]);
    }
  });
  
  const url = params.toString() 
    ? `/demand?${params.toString()}` 
    : "/demand";
  const res = await API.get(url);
  return res.data;
};

// Get single demand
export const getDemand = async (demandId) => {
  const res = await API.get(`/demand/${demandId}`);
  return res.data;
};

// Increment views for a demand
export const incrementDemandViews = async (demandId) => {
  try {
    // The backend already increments views when fetching, but we can also call it explicitly
    await API.get(`/demand/${demandId}`);
  } catch (err) {
    // Silently fail - views increment is not critical
    console.error("Error incrementing views:", err);
  }
};

// Create demand (authenticated)
export const createDemand = async (demandData) => {
  const res = await API.post("/demand", demandData);
  return res.data;
};

// Update demand (authenticated)
export const updateDemand = async (demandId, updates) => {
  const res = await API.put(`/demand/${demandId}`, updates);
  return res.data;
};

// Delete demand (authenticated)
export const deleteDemand = async (demandId) => {
  const res = await API.delete(`/demand/${demandId}`);
  return res.data;
};
