import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/auth";
import * as userApi from "../api/user";

//This context will be used across the app to share authentication status
const AuthContext = createContext();

//It wraps the entire application and provides authentication-related data
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // On app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Verify with backend
          const userData = await authApi.verifyToken(token);
          setUser(userData);
        } catch (error) {
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const { token } = await authApi.login(credentials);
      localStorage.setItem("token", token);

      const userData = await authApi.verifyToken(token);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      localStorage.removeItem("token");
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      // Directly return the API response
      return await authApi.signup(userData);
    } catch (error) {
      return {
        success: false,
        message: error.message || "Signup failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const updateUser = async (data) => {
    const token = localStorage.getItem("token");
    const updated = await userApi.updateUser(data, token);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, updateUser }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
