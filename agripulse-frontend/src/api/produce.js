import API from "./axiosInstance";

// Get produce listings with filters - V0.8
export const fetchProduce = async (query = {}) => {
  const params = new URLSearchParams();
  
  // Add all query parameters
  Object.keys(query).forEach(key => {
    if (query[key] !== undefined && query[key] !== null && query[key] !== "") {
      params.append(key, query[key]);
    }
  });
  
  const url = params.toString() 
    ? `/produce?${params.toString()}` 
    : "/produce";
  const res = await API.get(url);
  return res.data;
};

// Get single listing
export const getProduceListing = async (listingId) => {
  const res = await API.get(`/produce/${listingId}`);
  return res.data;
};

// Create listing (authenticated)
export const createProduceListing = async (listingData) => {
  const res = await API.post("/produce", listingData);
  return res.data;
};

// Update listing (authenticated)
export const updateProduceListing = async (listingId, updates) => {
  const res = await API.put(`/produce/${listingId}`, updates);
  return res.data;
};

// Delete listing (authenticated)
export const deleteProduceListing = async (listingId) => {
  const res = await API.delete(`/produce/${listingId}`);
  return res.data;
};
