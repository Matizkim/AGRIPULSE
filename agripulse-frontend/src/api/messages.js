import API from "./axiosInstance";

export const getMatchMessages = async (matchId) => {
  const res = await API.get(`/messages/match/${matchId}`);
  return res.data;
};

export const sendMessage = async (matchId, content, type = "text", attachments = []) => {
  const res = await API.post("/messages", {
    matchId,
    content,
    type,
    attachments
  });
  return res.data;
};

export const markMessagesRead = async (matchId) => {
  const res = await API.put(`/messages/read/${matchId}`);
  return res.data;
};