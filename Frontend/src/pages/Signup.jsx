import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiLogIn } from "react-icons/fi";
import { useSnackbar } from 'notistack';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!formData.username.trim()) {
      newErrors.username = "Full name is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be 8+ chars with letters and numbers";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const result = await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        enqueueSnackbar("Account created successfully!", { variant: "success" });
        navigate("/login");
      } else {
        // Handle backend validation errors
        if (result.message.includes("email")) {
          setErrors({ email: result.message });
        } else if (result.message.includes("password")) {
          setErrors({ password: result.message });
        }
        enqueueSnackbar(result.message, { variant: "error" });
      }
    } catch (error) {
      console.error("Signup error:", error);
      enqueueSnackbar("Registration failed. Please try again.", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="p-6 text-center" style={{ backgroundColor: "#2C3E50" }}>
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="mt-2" style={{ color: "#ECF0F1" }}>Reserve your spot today!</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {errors.general && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                <p>{errors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#333333" }}>
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="John Doe"
                    style={{ backgroundColor: "#ECF0F1" }}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#333333" }}>
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    name="email"
                    type="text"
                    value={formData.email}
                    onChange={handleChange}
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

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#333333" }}>
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="••••••••"
                    style={{ backgroundColor: "#ECF0F1" }}
                  />
                </div>
                {errors.password ? (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                ) : (
                  <p className="mt-1 text-xs" style={{ color: "#333333" }}>
                    Minimum 8 characters with letters and numbers
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#333333" }}>
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                  style={{ backgroundColor: "#ECF0F1" }}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
          </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="h-4 w-4 focus:ring-blue-500 border-gray-300 rounded"
                  style={{ color: "#16A085" }}
                />
              </div>
              <div className="ml-3">
                <label htmlFor="terms" className="block text-sm" style={{ color: "#333333" }}>
                  I agree to the <a href="#" className="hover:underline" style={{ color: "#16A085" }}>Terms</a> and <a href="#" className="hover:underline" style={{ color: "#16A085" }}>Privacy Policy</a>
                </label>
                {errors.agreeTerms && (
                  <p className="mt-1 text-xs text-red-500">{errors.agreeTerms}</p>
                )}
              </div>
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
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  <FiLogIn className="mr-2" />
                  Sign Up
                </>
              )}
            </motion.button>
          </form>

          <div className="px-8 py-4 text-center" style={{ backgroundColor: "#ECF0F1" }}>
            <p className="text-sm" style={{ color: "#333333" }}>
              Already have an account?{" "}
              <Link to="/login" className="font-medium hover:underline" style={{ color: "#16A085" }}>
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Signup;