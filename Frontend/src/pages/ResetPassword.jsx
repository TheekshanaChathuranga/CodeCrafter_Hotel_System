import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import { useSnackbar } from "notistack";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [isTokenChecking, setIsTokenChecking] = useState(true);
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    setIsTokenChecking(true);
    try {
      const response = await axios.get(
        `${API_URL}/auth/verify-reset-token/${token}`
      );

      if (response.data.success) {
        setIsTokenValid(true);
      } else {
        setIsTokenValid(false);
      }
    } catch (error) {
      console.error("Token verification error:", error);
      setIsTokenValid(false);
    } finally {
      setIsTokenChecking(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Please enter a new password.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        `${API_URL}/auth/reset-password/${token}`,
        {
          password: formData.password,
        }
      );

      if (response.data.success) {
        setIsResetSuccessful(true);
        enqueueSnackbar("Password reset successfully!", {
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);

      let errorMessage = "Failed to reset password";

      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage =
              error.response.data?.message || "Invalid or expired token";
            break;
          case 404:
            errorMessage = "Reset token not found or expired";
            break;
          default:
            errorMessage =
              error.response.data?.message || "Server error. Please try again.";
        }
      }

      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Loading state while checking token
  if (isTokenChecking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#ECF0F1" }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "#16A085" }}
          ></div>
          <p className="text-gray-600">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isTokenValid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#ECF0F1" }}
      >
        <div className="w-full max-w-md px-6 py-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            <div
              className="p-6 text-center"
              style={{ backgroundColor: "#E74C3C" }}
            >
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                <FiLock className="w-8 h-8" style={{ color: "#E74C3C" }} />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Invalid or Expired Link
              </h1>
              <p className="mt-2 text-white opacity-90">
                This password reset link is invalid or has expired
              </p>
            </div>

            <div className="p-8 text-center">
              <p className="text-gray-600 mb-6">
                Password reset links expire after 1 hour for security reasons.
              </p>

              <div className="space-y-3">
                <Link
                  to="/forgot-password"
                  className="block w-full py-2 px-4 rounded-lg text-white font-medium transition"
                  style={{ backgroundColor: "#16A085" }}
                >
                  Request New Reset Link
                </Link>

                <Link
                  to="/login"
                  className="block w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Success state
  if (isResetSuccessful) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#ECF0F1" }}
      >
        <div className="w-full max-w-md px-6 py-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            <div
              className="p-6 text-center"
              style={{ backgroundColor: "#27AE60" }}
            >
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                <FiCheckCircle
                  className="w-8 h-8"
                  style={{ color: "#27AE60" }}
                />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Password Reset Successful!
              </h1>
              <p className="mt-2 text-white opacity-90">
                Your password has been updated
              </p>
            </div>

            <div className="p-8 text-center">
              <p className="text-gray-600 mb-6">
                You can now log in with your new password.
              </p>

              <Link
                to="/login"
                className="block w-full py-2 px-4 rounded-lg text-white font-medium transition"
                style={{ backgroundColor: "#16A085" }}
              >
                Go to Login
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Reset password form
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#ECF0F1" }}
    >
      <div className="w-full max-w-md px-6 py-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          <div
            className="p-6 text-center"
            style={{ backgroundColor: "#2C3E50" }}
          >
            <h1 className="text-3xl font-bold text-white">Reset Password</h1>
            <p className="mt-2" style={{ color: "#ECF0F1" }}>
              Enter your new password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "#333333" }}
              >
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter new password"
                  style={{ backgroundColor: "#ECF0F1" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "#333333" }}
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm new password"
                  style={{ backgroundColor: "#ECF0F1" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                isLoading ? "opacity-75" : "hover:bg-opacity-90"
              }`}
              style={{ backgroundColor: "#16A085" }}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating Password...
                </>
              ) : (
                <>
                  <FiLock className="mr-2" />
                  Update Password
                </>
              )}
            </motion.button>
          </form>

          <div
            className="px-8 py-4 text-center"
            style={{ backgroundColor: "#ECF0F1" }}
          >
            <Link
              to="/login"
              className="text-sm font-medium hover:underline"
              style={{ color: "#16A085" }}
            >
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResetPassword;
