import API from "./axiosInstance";

export const sendSMS = async (payload) => {
  const res = await API.post("/sms/send", payload);
  return res.data;
};
