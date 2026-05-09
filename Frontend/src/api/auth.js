import axiosInstance, { API_URL } from '../config/axios.js';

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Contains token and userId on success
 */
export const login = async ({ email, password }) => {
  try {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Login failed' };
  }
};

/**
 * Register new user
 * @param {Object} userData - User data (username, email, password)
 * @returns {Promise} - Contains success status and message
 */
export const signup = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/signup', userData);
    return {
      success: response.data.success === true,
      message: response.data.message || 'User created successfully',
      user: response.data.user,
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Signup failed',
      error: error.message,
    };
  }
};

/**
 * Verify JWT token and get user details
 * @param {string} token - JWT token
 * @returns {Promise} - Contains user object
 */
export const verifyToken = async (token) => {
  try {
    const response = await axiosInstance.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.user;
  } catch (error) {
    localStorage.removeItem('token');
    throw error.response?.data?.message || 'Token verification failed';
  }
};

/**
 * Logout user (clear local storage)
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('user');
};

/**
 * Request password reset email
 * @param {string} email - User email
 * @returns {Promise}
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await axiosInstance.post('/auth/password-reset/request', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Password reset request failed' };
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} password - New password
 * @returns {Promise}
 */
export const resetPassword = async (token, password) => {
  try {
    const response = await axiosInstance.post('/auth/password-reset/reset', {
      token,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Password reset failed' };
  }
};