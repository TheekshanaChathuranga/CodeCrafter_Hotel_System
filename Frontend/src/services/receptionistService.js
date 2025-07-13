// Receptionist service for CRUD operations
import axios from "axios";

const API_BASE = "http://localhost:5000"; // adjust if using environment variables
const ENDPOINT = `${API_BASE}/api/manage/users`;

export const fetchReceptionists = async (params = {}, token) => {
  const res = await axios.get(ENDPOINT, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    params: {
      ...params,
      role: "receptionist",
    },
  });
  return res.data;
};

export const createReceptionist = async (data, token) => {
  const res = await axios.post(
    ENDPOINT,
    { ...data, role: "receptionist" },
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
};

export const updateReceptionist = async (id, data, token) => {
  const res = await axios.put(`${ENDPOINT}/${id}`, data, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

export const deleteReceptionist = async (id, token) => {
  const res = await axios.delete(`${ENDPOINT}/${id}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  return res.data;
}; 