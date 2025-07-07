import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext";

// Helper to get correct image URL
const getProfileImage = (imgPath) => {
  if (!imgPath || imgPath === "/img/default-profile.png")
    return "/img/default-profile.png";
  if (imgPath.startsWith("/uploads/")) {
    return (
      `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`.replace(
        /\/api$/,
        ""
      ) + imgPath
    );
  }
  return imgPath;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Color variables
  const colors = {
    primary: "#2C3E50",
    secondary: "#16A085",
    accent: "#E74C3C",
    background: "#ECF0F1",
    text: "#333333",
    success: "#27AE60",
    info: "#3498DB",
    white: "#FFFFFF",
  };

  // Hover styles
  const linkHover = {
    backgroundColor: "#34495E",
    transition: "background-color 0.3s ease",
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav
      className="shadow-lg"
      style={{ backgroundColor: colors.primary, color: colors.white }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <img
              src="/src/img/logo.jpg"
              alt="Logo"
              className="h-8 w-8 rounded-full"
            />
            <Link
              to="/"
              className="ml-2 text-xl font-bold"
              style={{ color: colors.white }}
            >
              The Lake Resort
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/" hoverStyle={linkHover}>
              Home
            </NavLink>
            <NavLink to="/room-booking" hoverStyle={linkHover}>
              Room Booking
            </NavLink>
            <NavLink to="/pool-booking" hoverStyle={linkHover}>
              Pool Booking
            </NavLink>
            <NavLink to="/event-booking" hoverStyle={linkHover}>
              Event Booking
            </NavLink>
            <NavLink to="/about" hoverStyle={linkHover}>
              About
            </NavLink>
            <NavLink to="/contact" hoverStyle={linkHover}>
              Contact
            </NavLink>
            {user?.role === "admin" && (
              <NavLink to="/admin" hoverStyle={linkHover}>
                Dashboard
              </NavLink>
            )}
          </div>

          {/* Right side - Auth/Profile Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.white,
                  }}
                  title="Logout"
                >
                  Logout
                </button>
                <div className="relative group">
                  <Link to="/profile" className="flex items-center">
                    <img
                      src={getProfileImage(user.profilePicture)}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover border-2 border-white shadow hover:ring-2 hover:ring-[#16A085] transition"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/img/default-profile.png";
                      }}
                    />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <AuthLink to="/login" color={colors.info}>
                  Login
                </AuthLink>
                <AuthLink to="/signup" color={colors.success}>
                  Sign Up
                </AuthLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-2 space-y-2">
            <MobileLink to="/" onClick={toggleMenu}>
              Home
            </MobileLink>
            <MobileLink to="/room-booking" onClick={toggleMenu}>
              Room Booking
            </MobileLink>
            <MobileLink to="/pool-booking" onClick={toggleMenu}>
              Pool Booking
            </MobileLink>
            <MobileLink to="/event-booking" onClick={toggleMenu}>
              Event Booking
            </MobileLink>
            <MobileLink to="/about" onClick={toggleMenu}>
              About
            </MobileLink>
            <MobileLink to="/contact" onClick={toggleMenu}>
              Contact
            </MobileLink>
            {user?.role === "admin" && (
              <MobileLink to="/admin" onClick={toggleMenu}>
                Dashboard
              </MobileLink>
            )}
            <div className="border-t pt-2 mt-2">
              {user ? (
                <>
                  <MobileButton onClick={logout}>Logout</MobileButton>
                  <MobileLink to="/profile" onClick={toggleMenu}>
                    <div className="flex items-center gap-2">
                      <img
                        src={getProfileImage(user.profilePicture)}
                        alt="Profile"
                        className="h-9 w-9 rounded-full object-cover border border-gray-300 shadow"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/img/default-profile.png";
                        }}
                      />
                      <span className="sr-only">Profile</span>
                    </div>
                  </MobileLink>
                </>
              ) : (
                <>
                  <MobileLink to="/login" onClick={toggleMenu}>
                    Login
                  </MobileLink>
                  <MobileLink to="/signup" onClick={toggleMenu}>
                    Sign Up
                  </MobileLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Reusable component for desktop navigation links
const NavLink = ({ to, children, hoverStyle }) => (
  <Link
    to={to}
    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[#34495E] transition-colors"
    style={{ color: "#FFFFFF" }}
  >
    {children}
  </Link>
);

// Reusable component for auth buttons
const AuthLink = ({ to, color, children }) => (
  <Link
    to={to}
    className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:opacity-90"
    style={{ backgroundColor: color, color: "#FFFFFF" }}
  >
    {children}
  </Link>
);

// Reusable component for mobile links
const MobileLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-4 py-2 text-sm hover:bg-gray-700 rounded-md"
  >
    {children}
  </Link>
);

// Reusable component for mobile buttons
const MobileButton = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 rounded-md"
  >
    {children}
  </button>
);

export default Navbar;
