import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { useSnackbar } from "notistack";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
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
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email: email.trim().toLowerCase()
      });

      if (response.data.success) {
        setIsEmailSent(true);
        enqueueSnackbar("Password reset email sent successfully!", { 
          variant: "success" 
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);

      let errorMessage = "Failed to send reset email";
      let fieldErrors = {};

      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = "No account found with this email address";
            fieldErrors = { email: errorMessage };
            break;
          case 400:
            errorMessage = error.response.data?.message || "Invalid email address";
            fieldErrors = { email: errorMessage };
            break;
          default:
            errorMessage = error.response.data?.message || "Server error. Please try again.";
        }
      }

      setErrors(fieldErrors);
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
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
              style={{ backgroundColor: "#16A085" }}
            >
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                <FiMail className="w-8 h-8" style={{ color: "#16A085" }} />
              </div>
              <h1 className="text-2xl font-bold text-white">Email Sent!</h1>
              <p className="mt-2 text-white opacity-90">
                Check your email for reset instructions
              </p>
            </div>

            <div className="p-8 text-center">
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to{" "}
                <span className="font-medium">{email}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                The link will expire in 1 hour. If you don't see the email, 
                check your spam folder.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsEmailSent(false);
                    setEmail("");
                  }}
                  className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Send to different email
                </button>
                
                <Link
                  to="/login"
                  className="block w-full py-2 px-4 rounded-lg text-white font-medium transition"
                  style={{ backgroundColor: "#16A085" }}
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
            <h1 className="text-3xl font-bold text-white">Forgot Password?</h1>
            <p className="mt-2" style={{ color: "#ECF0F1" }}>
              Enter your email to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "#333333" }}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: "" });
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="your@email.com"
                  style={{ backgroundColor: "#ECF0F1" }}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
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
                  Sending...
                </>
              ) : (
                <>
                  <FiMail className="mr-2" />
                  Send Reset Email
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
              className="inline-flex items-center text-sm font-medium hover:underline"
              style={{ color: "#16A085" }}
            >
              <FiArrowLeft className="mr-1" />
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
