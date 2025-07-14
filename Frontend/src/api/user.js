import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const updateUser = async (data, token) => {
  try {
    const res = await axios.put(`${API_URL}/profile/update-profile`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data.user;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to update profile"
    );
  }
};
