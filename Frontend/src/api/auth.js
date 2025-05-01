import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    // Properly re-throw the full Axios error object
    throw error;
  }
};


export const signup = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/signup`, userData);
    
    // Ensure we never return undefined success
    if (!response.data) {
      throw new Error('Empty response from server');
    }
    
    // Explicitly return the success status from backend
    return {
      success: response.data.success === true, // force boolean
      message: response.data.message || 'User created',
      user: response.data.user
    };
    
  } catch (error) {
    console.error('Signup error:', error);
    return { // Return instead of throw to prevent try/catch in component
      success: false,
      message: error.response?.data?.message || 'Signup failed',
      error: error.message
    };
  }
};

export const verifyToken = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.user;
  } catch (error) {
    throw error.response?.data?.message || 'Token verification failed';
  }
};