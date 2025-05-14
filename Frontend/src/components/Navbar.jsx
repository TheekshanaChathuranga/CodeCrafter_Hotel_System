import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/UserAuthContext';

const Navbar = () => {
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
            {/* Reception Links */}
            {user?.role === 'reception' && (
              <>
                <Link
                  to="/reception/home"
                  className="px-3 py-2 rounded-md text-sm font-medium"
                  style={{
                    color: colors.white,
                    ':hover': linkHover
                  }}
                >
                  Dashboard
                </Link>
                <Link
                  to="/reception/roomBooking"
                  className="px-3 py-2 rounded-md text-sm font-medium"
                  style={{
                    color: colors.white,
                    ':hover': linkHover
                  }}
                >
                  Room Booking
                </Link>
                <Link
                  to="/reception/bookingsList"
                  className="px-3 py-2 rounded-md text-sm font-medium"
                  style={{
                    color: colors.white,
                    ':hover': linkHover
                  }}
                >
                  Reservations
                </Link>
                <Link
                  to="/pool-booking"
                  className="px-3 py-2 rounded-md text-sm font-medium"
                  style={{
                    color: colors.white,
                    ':hover': linkHover
                  }}
                >
                  Pool Booking
                </Link>
                <Link
                  to="/pool-schedules"
                  className="px-3 py-2 rounded-md text-sm font-medium"
                  style={{
                    color: colors.white,
                    ':hover': linkHover
                  }}
                >
                  Pool Schedules
                </Link>
              </>
            )}

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

            {/* Show Home and About only when not logged in or for other roles */}
            {(!user || user?.role !== 'reception') && (
              <>
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
                  to="/about" 
                  className="px-3 py-2 rounded-md text-sm font-medium"
                  style={{ 
                    color: colors.white,
                    ':hover': linkHover
                  }}
                >
                  About
                </Link>
              </>
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
};

export default Navbar;