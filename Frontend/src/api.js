import axiosInstance from './config/axios.js';

/**
 * User API functions
 */
export const getUserProfile = async () => {
  const response = await axiosInstance.get('/profile');
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await axiosInstance.put('/profile', data);
  return response.data;
};

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosInstance.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Room API functions
 */
export const getRooms = async (filters = {}) => {
  const response = await axiosInstance.get('/rooms', { params: filters });
  return response.data;
};

export const getRoomById = async (id) => {
  const response = await axiosInstance.get(`/rooms/${id}`);
  return response.data;
};

/**
 * Booking API functions
 */
export const createBooking = async (bookingData) => {
  const response = await axiosInstance.post('/bookings', bookingData);
  return response.data;
};

export const getUserBookings = async () => {
  const response = await axiosInstance.get('/user-bookings');
  return response.data;
};

export const getBookingById = async (id) => {
  const response = await axiosInstance.get(`/bookings/${id}`);
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await axiosInstance.delete(`/bookings/${id}`);
  return response.data;
};

/**
 * Pool API functions
 */
export const getPools = async () => {
  const response = await axiosInstance.get('/pools');
  return response.data;
};

export const getPoolById = async (id) => {
  const response = await axiosInstance.get(`/pool-details/${id}`);
  return response.data;
};

/**
 * Pool Booking API functions
 */
export const createPoolBooking = async (bookingData) => {
  const response = await axiosInstance.post('/pool-booking', bookingData);
  return response.data;
};

export const getUserPoolBookings = async () => {
  const response = await axiosInstance.get('/poolBookings');
  return response.data;
};

export const cancelPoolBooking = async (id) => {
  const response = await axiosInstance.delete(`/pool-booking/${id}`);
  return response.data;
};

/**
 * Event API functions
 */
export const getEvents = async () => {
  const response = await axiosInstance.get('/events');
  return response.data;
};

export const getEventById = async (id) => {
  const response = await axiosInstance.get(`/events/${id}`);
  return response.data;
};

/**
 * Customer Event API functions
 */
export const createCustomerEvent = async (eventData) => {
  const response = await axiosInstance.post('/customer-events', eventData);
  return response.data;
};

export const getUserCustomerEvents = async () => {
  const response = await axiosInstance.get('/customer-events');
  return response.data;
};

export const updateCustomerEvent = async (id, eventData) => {
  const response = await axiosInstance.put(`/customer-events/${id}`, eventData);
  return response.data;
};

export const cancelCustomerEvent = async (id) => {
  const response = await axiosInstance.delete(`/customer-events/${id}`);
  return response.data;
};

/**
 * Food Items API functions
 */
export const getFoodItems = async () => {
  const response = await axiosInstance.get('/fooditems');
  return response.data;
};

export const orderFoodItems = async (orderData) => {
  const response = await axiosInstance.post('/fooditems/order', orderData);
  return response.data;
};

/**
 * Notifications API functions
 */
export const getNotifications = async () => {
  const response = await axiosInstance.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await axiosInstance.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await axiosInstance.put('/notifications/mark-all-read');
  return response.data;
};

/**
 * Admin API functions
 */
export const getDashboard = async () => {
  const response = await axiosInstance.get('/dashboard');
  return response.data;
};

export const getAdminNotifications = async () => {
  const response = await axiosInstance.get('/admin/notifications');
  return response.data;
};

export const confirmBooking = async (bookingId, confirmationData) => {
  const response = await axiosInstance.post(
    `/admin/bookings/${bookingId}/confirm`,
    confirmationData
  );
  return response.data;
};

export const rejectBooking = async (bookingId, reason) => {
  const response = await axiosInstance.post(
    `/admin/bookings/${bookingId}/reject`,
    { reason }
  );
  return response.data;
};

/**
 * User Management API functions (Admin only)
 */
export const getAllUsers = async (filters = {}) => {
  const response = await axiosInstance.get('/manage/users', { params: filters });
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axiosInstance.post(`/manage/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/manage/users/${id}`);
  return response.data;
};

export const changeUserStatus = async (id, status) => {
  const response = await axiosInstance.post(`/manage/users/${id}/status`, { status });
  return response.data;
};

/**
 * Health check
 */
export const healthCheck = async () => {
  const response = await axiosInstance.get('/health');
  return response.data;
};

export default {
  // User
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,

  // Rooms
  getRooms,
  getRoomById,

  // Bookings
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,

  // Pools
  getPools,
  getPoolById,

  // Pool Bookings
  createPoolBooking,
  getUserPoolBookings,
  cancelPoolBooking,

  // Events
  getEvents,
  getEventById,

  // Customer Events
  createCustomerEvent,
  getUserCustomerEvents,
  updateCustomerEvent,
  cancelCustomerEvent,

  // Food
  getFoodItems,
  orderFoodItems,

  // Notifications
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,

  // Admin
  getDashboard,
  getAdminNotifications,
  confirmBooking,
  rejectBooking,
  getAllUsers,
  updateUser,
  deleteUser,
  changeUserStatus,

  // Health
  healthCheck,
};
