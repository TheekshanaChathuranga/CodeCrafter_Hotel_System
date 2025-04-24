import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-[#1a365d] p-4 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left Side - Hotel Logo/Name */}
        <div className="flex items-center space-x-2">
          <img 
            src="/assets/hotel-icon.png" 
            alt="Hotel Logo" 
            className="w-10 h-10"
          />
          <h1 className="text-xl font-bold text-[#f7fafc] hidden sm:block">
            Lakeview Resort Console
          </h1>
        </div>

        {/* Mobile Menu Button */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Right Side - Navigation Links (Desktop) */}
        <div className="hidden sm:flex items-center space-x-1 md:space-x-2 lg:space-x-3">
          <div className="flex space-x-1 md:space-x-2 lg:space-x-3">
            <NavLink to="/" text="Dashboard" />
            <NavLink to="/booking" text="Room Booking" />
            <NavLink to="/bookings" text="Room Reservations" />
            <NavLink to="/calendar" text="Calendar" />
            <NavLink to="/pool-booking" text="Pool Booking" />
            <NavLink to="/pool-reservations" text="Pool Schedule" />
          </div>
          <div className="ml-2 md:ml-4">
            <ProfileAvatar navigate={navigate} />
          </div>
        </div>
      </div>

      {/* Mobile Menu (Dropdown) */}
      {isMenuOpen && (
        <div className="sm:hidden bg-[#2c5282] mt-2 rounded-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <MobileNavLink to="/" text="Dashboard" toggleMenu={toggleMenu} />
            <MobileNavLink to="/booking" text="Room Booking" toggleMenu={toggleMenu} />
            <MobileNavLink to="/bookings" text="Room Reservations" toggleMenu={toggleMenu} />
            <MobileNavLink to="/view-bookings" text="Booking Calendar" toggleMenu={toggleMenu} />
            <MobileNavLink to="/pool-booking" text="Pool Booking" toggleMenu={toggleMenu} />
            <MobileNavLink to="/pool-reservations" text="Pool Reservations" toggleMenu={toggleMenu} />
            
            <div className="flex items-center px-3 py-2">
              <ProfileAvatar navigate={navigate} />
              <span className="ml-3">Staff Profile</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// Reusable component for desktop navigation links
function NavLink({ to, text }) {
  return (
    <Link 
      to={to} 
      className="px-2 py-1 md:px-3 md:py-2 rounded-md text-xs md:text-sm font-medium bg-[#2c5282] hover:bg-[#4299e1] transition-colors whitespace-nowrap"
    >
      {text}
    </Link>
  );
}

// Reusable component for mobile navigation links
function MobileNavLink({ to, text, toggleMenu }) {
  return (
    <Link 
      to={to}
      onClick={toggleMenu}
      className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#4299e1] transition-colors"
    >
      {text}
    </Link>
  );
}

// Reusable profile avatar component
function ProfileAvatar({ navigate }) {
  return (
    <div className="relative group">
      <img 
        src="/assets/receptionist-avatar.png" 
        alt="Receptionist Profile" 
        className="w-8 h-8 md:w-10 md:h-10 rounded-full cursor-pointer border-2 border-[#4299e1] hover:border-[#ebf8ff] transition-colors"
        onClick={() => navigate("/receptionist-profile")}
      />
      <span className="absolute -bottom-2 right-0 bg-[#e53e3e] text-xs text-white px-1 rounded-full">Staff</span>
    </div>
  );
}