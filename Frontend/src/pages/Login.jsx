import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import { SnackbarProvider, useSnackbar } from 'notistack'

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login({ email, password });
      enqueueSnackbar("Login successful!", { variant: "success" });
      navigate("/");
    } catch (error) {
      enqueueSnackbar(error.message || "Login failed", { variant: "error" });
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
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="mt-2" style={{ color: "#ECF0F1" }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#333333" }}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="your@email.com"
                    required
                    style={{ backgroundColor: "#ECF0F1" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#333333" }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="••••••••"
                    required
                    style={{ backgroundColor: "#ECF0F1" }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 focus:ring-blue-500 border-gray-300 rounded"
                  style={{ color: "#16A085" }}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm" style={{ color: "#333333" }}>
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium hover:underline" style={{ color: "#16A085" }}>
                  Forgot password?
                </Link>
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
                  Signing in...
                </>
              ) : (
                <>
                  <FiLogIn className="mr-2" />
                  Sign in
                </>
              )}
            </motion.button>
          </form>

          <div className="px-8 py-4 text-center" style={{ backgroundColor: "#ECF0F1" }}>
            <p className="text-sm" style={{ color: "#333333" }}>
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium hover:underline" style={{ color: "#16A085" }}>
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;