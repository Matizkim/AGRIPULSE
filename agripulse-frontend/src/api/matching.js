import API from "./axiosInstance";

export const getMatchSuggestions = async (type, id, limit = 10) => {
  const params = new URLSearchParams({
    type,
    limit: limit.toString()
  });
  
  if (type === "forDemand") {
    params.append("demandId", id);
  } else if (type === "forListing") {
    params.append("listingId", id);
  }
  
  const res = await API.get(`/matching/suggestions?${params.toString()}`);
  return res.data;
};