import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaHome, 
  FaBed, 
  FaSwimmingPool, 
  FaCalendarAlt, 
  FaUsers,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaBars,
  FaTimes
} from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items
  const navItems = [
    { icon: <FaHome />, label: "Dashboard", path: "/" },
    { icon: <FaBed />, label: "Room Booking", path: "/booking" },
    { icon: <FaCalendarAlt />, label: "Room Reservations", path: "/bookings" },
    { icon: <FaSwimmingPool />, label: "Pool Booking", path: "/pool-booking" },
    { icon: <FaCalendarAlt />, label: "Pool Schedule", path: "/pool-bookings" },
    { icon: <FaUsers />, label: "Guests", path: "/guests" },
    { icon: <FaChartBar />, label: "Reports", path: "/reports" },
    { icon: <FaCog />, label: "Settings", path: "/settings" }
  ];

  // Quick stats data
  const quickStats = [
    { label: "Occupied Rooms", value: "24", trend: "up" },
    { label: "Available Rooms", value: "16", trend: "down" },
    { label: "Today's Check-ins", value: "8", trend: "up" },
    { label: "Today's Check-outs", value: "5", trend: "same" }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-800 text-white p-2 rounded-lg"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Left Side Navigation */}
      <div className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transform fixed md:static inset-y-0 left-0 w-64 bg-blue-800 
        text-white shadow-lg transition-transform duration-300 ease-in-out z-40`}>
        <div className="p-4 border-b border-blue-700">
          <h1 className="text-xl font-bold">Lakeview Resort</h1>
          <p className="text-sm text-blue-200">Receptionist Dashboard</p>
        </div>
        
        <nav className="mt-4 h-[calc(100%-120px)] overflow-y-auto">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              className="flex items-center w-full px-4 py-3 text-left hover:bg-blue-700 transition-colors"
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-blue-700 bg-blue-800">
          <button className="flex items-center text-white hover:text-blue-200 w-full">
            <FaSignOutAlt className="mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto md:ml-20">
        {/* Header */}
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Dashboard Overview</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaBell className="text-gray-500 text-xl" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
              <div className="flex items-center">
                <img 
                  src="https://via.placeholder.com/40" 
                  alt="User" 
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="text-sm font-medium hidden sm:inline">Receptionist</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 md:p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-white p-3 md:p-4 rounded-lg shadow">
                <p className="text-xs md:text-sm text-gray-500">{stat.label}</p>
                <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
                <div className={`text-xs mt-1 ${
                  stat.trend === "up" ? "text-green-500" : 
                  stat.trend === "down" ? "text-red-500" : "text-gray-500"
                }`}>
                  {stat.trend === "up" ? "↑ 5% from yesterday" : 
                   stat.trend === "down" ? "↓ 2% from yesterday" : "No change"}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-6 md:mb-8">
            <h3 className="text-md md:text-lg font-semibold mb-3 md:mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              <button 
                onClick={() => navigate("/booking")}
                className="bg-blue-100 hover:bg-blue-200 p-3 md:p-4 rounded-lg transition-colors flex flex-col items-center"
              >
                <FaBed className="text-blue-600 text-lg md:text-xl mb-1 md:mb-2" />
                <span className="text-xs md:text-sm font-medium text-center">New Booking</span>
              </button>
              <button 
                onClick={() => navigate("/pool-booking")}
                className="bg-teal-100 hover:bg-teal-200 p-3 md:p-4 rounded-lg transition-colors flex flex-col items-center"
              >
                <FaSwimmingPool className="text-teal-600 text-lg md:text-xl mb-1 md:mb-2" />
                <span className="text-xs md:text-sm font-medium text-center">Pool Booking</span>
              </button>
              <button 
                onClick={() => navigate("/bookings")}
                className="bg-green-100 hover:bg-green-200 p-3 md:p-4 rounded-lg transition-colors flex flex-col items-center"
              >
                <FaCalendarAlt className="text-green-600 text-lg md:text-xl mb-1 md:mb-2" />
                <span className="text-xs md:text-sm font-medium text-center">View Bookings</span>
              </button>
              <button 
                onClick={() => navigate("/guests")}
                className="bg-purple-100 hover:bg-purple-200 p-3 md:p-4 rounded-lg transition-colors flex flex-col items-center"
              >
                <FaUsers className="text-purple-600 text-lg md:text-xl mb-1 md:mb-2" />
                <span className="text-xs md:text-sm font-medium text-center">Guest List</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-md md:text-lg font-semibold mb-3 md:mb-4">Recent Activity</h3>
            <div className="space-y-2 md:space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="border-b pb-2 md:pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm md:text-base font-medium">Room #{item}0{item}</p>
                      <p className="text-xs md:text-sm text-gray-500">Checked in by Guest {item}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs md:text-sm font-medium">RS.{item}50/night</p>
                      <p className="text-xxs md:text-xs text-gray-500">Today at {item}:00 PM</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}