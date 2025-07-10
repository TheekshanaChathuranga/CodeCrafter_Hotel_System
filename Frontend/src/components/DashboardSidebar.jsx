import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Hotel, Users, Menu, LifeBuoy,
  CalendarCheck, UserCheck, Settings, LogOut, User,
  Bell, LayoutDashboard, BookOpen, CalendarDays, Clock, X
} from "lucide-react";
import { useAuth } from "../context/UserAuthContext";

const DashboardSidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const allMenuItems = [
    // Dashboard for both roles
    {
      title: "Dashboard",
      url: { admin: "/admin", reception: "/receptionist/home" },
      icon: <LayoutDashboard size={18} />,
      roles: ["admin", "reception"],
    },
    // Admin-specific items
    {
      title: "Rooms",
      url: { admin: "/admin/rooms", reception: "" },
      icon: <Hotel size={18} />,
      roles: ["admin"],
    },
    {
      title: "Users",
      url: { admin: "/admin/users" },
      icon: <UserCheck size={18} />,
      roles: ["admin"],
    },
    {
      title: "Settings",
      url: { admin: "/admin/settings" },
      icon: <Settings size={18} />,
      roles: ["admin"],
    },
    {
      title: "Notifications",
      url: { admin: "/admin/bookingNotifications" },
      icon: <Bell size={18} />,
      roles: ["admin"],
    },
    // Reception and shared routes
    {
      title: "Room Booking",
      url: { admin: "/admin/rooms", reception: "/receptionist/roomBooking" },
      icon: <Hotel size={18} />,
      roles: ["reception"],
    },
    {
      title: "Reservations",
      url: {
        admin: "/admin/reservations",
        reception: "/receptionist/bookingsList",
      },
      icon: <BookOpen size={18} />,
      roles: ["admin", "reception"],
    },
    {
      title: "Pool Booking",
      url: {
        admin: "/admin/pools",
        reception: "/receptionist/pool-booking",
      },
      icon: <LifeBuoy size={18} />,
      roles: ["admin", "reception"],
    },
    {
      title: "Pool Schedules",
      url: {
        admin: "/admin/pool-schedules",
        reception: "/receptionist/pool-schedules",
      },
      icon: <Clock size={18} />,
      roles: ["admin", "reception"],
    },
  ];

  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(user.role) || 
    (user.role === "receptionist" && item.roles.includes("reception"))
  );

  const handleLinkClick = () => {
    if (onClose) {
      onClose(); // Close mobile sidebar
    }
  };

  return (
    <div
      className={`bg-[#2C3E50] text-white h-full transition-all duration-300 flex flex-col justify-between ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-2 hover:bg-[#34495E] rounded"
          >
            <Menu />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-[#34495E] rounded ml-auto"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* User Info */}
        <div
          className={`flex items-center gap-3 mb-8 ${
            !isOpen ? "justify-center" : ""
          }`}
        >
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4g_2Qj3LsNR-iqUAFm6ut2EQVcaou4u2YXw&s"
            alt="User avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          {isOpen && (
            <div>
              <div className="font-semibold">{user.username}</div>
              <div className="text-sm text-gray-300">{user.role}</div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.title}>
              <Link
                to={item.url[user.role]}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 p-2 rounded hover:bg-[#34495E] transition-colors ${
                  !isOpen ? "justify-center" : ""
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {isOpen && <span>{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Profile & Sign Out */}
      <div className="p-4 space-y-2">
        <Link
          to={user.role === "admin" ? "/admin/profile" : "/receptionist/profile"}
          onClick={handleLinkClick}
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#34495E] transition-colors ${
            !isOpen ? "justify-center" : ""
          }`}
        >
          <User size={18} />
          {isOpen && <span>Profile</span>}
        </Link>
        <button
          onClick={() => {
            logout();
            if (onClose) onClose();
          }}
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#34495E] w-full transition-colors ${
            !isOpen ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} />
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
