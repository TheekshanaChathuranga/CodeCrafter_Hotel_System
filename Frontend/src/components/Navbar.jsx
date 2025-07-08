import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/UserAuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const colors = {
    primary: '#2C3E50',
    accent: '#E74C3C',
    success: '#27AE60',
    info: '#3498DB',
    white: '#FFFFFF'
  };

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/src/img/logo.jpg" alt="Logo" className="h-8 w-8 rounded-full" />
            <Link to="/" className="text-xl font-bold text-white hover:text-blue-300 transition-colors">
              The Lake Hotel
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <Link to="/room-booking" className="hover:text-blue-400 transition-colors">Room Booking</Link>
            <Link to="/pool-booking" className="hover:text-blue-400 transition-colors">Pool Booking</Link>
            <Link to="/event-booking" className="hover:text-blue-400 transition-colors">Event Booking</Link>
            <Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-blue-400 transition-colors">Contact</Link>

            {/* Admin Dashboard */}
            {user?.role === 'admin' && (
              <Link to="/admin" className="hover:text-yellow-400 transition-colors">Dashboard</Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-white hidden md:inline">Welcome, {user.username}</span>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Optional Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md hover:bg-gray-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
