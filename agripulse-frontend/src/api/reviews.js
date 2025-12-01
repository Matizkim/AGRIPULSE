import API from "./axiosInstance";

export const createReview = async (matchId, rating, comment, categories) => {
  const res = await API.post("/reviews", {
    matchId,
    rating,
    comment,
    categories
  });
  return res.data;
};

export const getUserReviews = async (userId) => {
  const res = await API.get(`/reviews/user/${userId}`);
  return res.data;
};

export const getMatchReviews = async (matchId) => {
  const res = await API.get(`/reviews/match/${matchId}`);
  return res.data;
};