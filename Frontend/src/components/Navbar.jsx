<<<<<<< HEAD
import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
=======
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/UserAuthContext';
>>>>>>> c14f77bbefb760989602ec8c9898b5b7c2ec0e2d

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Color variables
  const colors = {
    primary: '#2C3E50',
    secondary: '#16A085',
    accent: '#E74C3C',
    background: '#ECF0F1',
    text: '#333333',
    success: '#27AE60',
    info: '#3498DB',
    white: '#FFFFFF'
  };

  // Hover styles
  const linkHover = {
    backgroundColor: '#34495E', // Darker primary
    transition: 'background-color 0.3s ease'
  };

  return (
    <nav 
      className="shadow-lg"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo/Brand */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="text-xl font-bold"
              style={{ color: colors.white }}
            >
              The Lake Hotel
            </Link>
          </div>

          {/* Center - Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className="px-3 py-2 rounded-md text-sm font-medium"
              style={{ 
                color: colors.white,
                ':hover': linkHover
              }}
            >
              Home
            </Link>
            
            <Link 
              to="/rooms" 
              className="px-3 py-2 rounded-md text-sm font-medium"
              style={{ 
                color: colors.white,
                ':hover': linkHover
              }}
            >
              Rooms
            </Link>

            <Link 
              to="/add-room" 
              className="px-3 py-2 rounded-md text-sm font-medium"
              style={{ 
                color: colors.white,
                ':hover': linkHover
              }}
            >
              Add Room
            </Link>

            <Link 
              to="/about" 
              className="px-3 py-2 rounded-md text-sm font-medium"
              style={{ 
                color: colors.white,
                ':hover': linkHover
              }}
            >
              About
            </Link>

            {/* Admin Dashboard Button */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-md text-sm font-medium"
                style={{
                  color: colors.white,
                  ':hover': linkHover
                }}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right side - Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span 
                  className="text-sm font-medium"
                  style={{ color: colors.white }}
                >
                  Welcome, {user.username}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-md text-sm font-medium"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.white,
                    ':hover': {
                      backgroundColor: '#C0392B',
                      transition: 'background-color 0.3s ease'
                    }
                  }}
                >
                  Logout
                </button>
                <img 
                  src="/assets/react.svg" 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full cursor-pointer" 
                  onClick={() => navigate("/profile")}
                />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium"
                  style={{
                    backgroundColor: colors.info,
                    color: colors.white,
                    ':hover': {
                      backgroundColor: '#2980B9',
                      transition: 'background-color 0.3s ease'
                    }
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-md text-sm font-medium"
                  style={{
                    backgroundColor: colors.success,
                    color: colors.white,
                    ':hover': {
                      backgroundColor: '#219955',
                      transition: 'background-color 0.3s ease'
                    }
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
