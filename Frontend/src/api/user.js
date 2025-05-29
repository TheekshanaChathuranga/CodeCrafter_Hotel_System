import axios from "axios";

export const updateUser = async (data, token) => {
  const res = await axios.put("/api/profile/update-profile", data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data.user;
};
