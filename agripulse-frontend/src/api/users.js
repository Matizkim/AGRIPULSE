import API from "./axiosInstance";

export const getCurrentUser = async () => {
  const res = await API.get("/users/me");
  return res.data;
};

export const updateUser = async (updates) => {
  console.log("📤 API: Updating user with:", updates);
  console.log("  - Roles:", updates.roles);
  console.log("  - Primary Role:", updates.primaryRole);
  
  const res = await API.put("/users/me", updates);
  
  console.log("✅ API: User updated, received:", res.data);
  console.log("  - Saved Roles:", res.data.roles);
  console.log("  - Saved Primary Role:", res.data.primaryRole);
  
  return res.data;
};

export const getUserProfile = async (userId) => {
  const res = await API.get(`/users/${userId}`);
  return res.data;
};