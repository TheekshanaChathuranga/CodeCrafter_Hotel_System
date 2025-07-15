import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Hotel,
  Users,
  Menu,
  LifeBuoy,
  CalendarCheck,
  UserCheck,
  Settings,
  LogOut,
  User,
  Bell,
  LayoutDashboard,
  BookOpen,
  Clock,
  Utensils,
} from "lucide-react";
import { useAuth } from "../context/UserAuthContext";
import { useSocket } from "../context/SocketContext";

const DashboardSidebar = () => {
  const { user, logout } = useAuth();
  const { unreadBookings, markBookingsAsRead } = useSocket();
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Helper to get correct image URL (copied from Profile.jsx)
  const getProfileImage = (imgPath) => {
    if (!imgPath || imgPath === "/img/default-profile.png")
      return "/img/default-profile.png";
    if (imgPath.startsWith("/uploads/")) {
      return (
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }`.replace(/\/api$/, "") + imgPath
      );
    }
    return imgPath;
  };

  const allMenuItems = [
    // Dashboard for both roles
    {
      title: "Dashboard",
      url: {
        admin: "/admin/dashboard",
        receptionist: "/receptionist",
        reception: "/receptionist",
      },
      icon: <LayoutDashboard size={18} />,
      roles: ["admin", "receptionist", "reception"],
    },
    // Admin-specific items
    {
      title: "Rooms",
      url: { admin: "/admin/rooms", reception: "" },
      icon: <Hotel size={18} />,
      roles: ["admin"],
    },
    {
      title: "Pools",
      url: { admin: "/admin/pools" },
      icon: <LifeBuoy size={18} />,
      roles: ["admin"],
    },
    {
      title: "Users",
      url: { admin: "/admin/users" },
      icon: <UserCheck size={18} />,
      roles: ["admin"],
    },

    {
      title: "Event Booking",
      url: { admin: "/admin/event-booking" },
      icon: <CalendarCheck size={18} />,
      roles: ["admin"],
    },
    // {
    //   title: "Event List",
    //   url: { admin: "/admin/event-list" },
    //   icon: <Menu size={18} />,
    //   roles: ["admin"],
    // },


    {
      title: "Notifications",
      url: { admin: "/admin/bookingNotifications" },
      icon: <Bell size={18} />,
      roles: ["admin"],
    },
    {
      title: "Menu Management",
      url: { admin: "/admin/menu-management" },
      icon: <Utensils size={18} />,
      roles: ["admin"],
    },
    // Reception and shared routes
    {
      title: "Room Booking",
      url: {
        admin: "/receptionist/rooms",
        receptionist: "/receptionist/rooms",
        reception: "/receptionist/rooms",
      },
      icon: <Hotel size={18} />,
      roles: ["receptionist", "reception", "admin"],
    },
    {
      title: "Room Reservations",
      url: {
        admin: "/admin/reservations",
        receptionist: "/receptionist/bookings",
        reception: "/receptionist/bookings",
      },
      icon: <BookOpen size={18} />,
      roles: ["admin", "receptionist", "reception"],
    },
    {
      title: "Pool Booking",
      url: {
        admin: "/receptionist/pool-booking",
        receptionist: "/receptionist/pool-booking",
        reception: "/receptionist/pool-booking",
      },
      icon: <LifeBuoy size={18} />,
      roles: ["admin", "receptionist", "reception"],
    },
    {
      title: "Pool Schedules",
      url: {
        receptionist: "/receptionist/pool-bookings",
        reception: "/receptionist/pool-bookings",
      },
      icon: <Clock size={18} />,
      roles: ["receptionist", "reception"],
    },
  ];

  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(user.role)
  );

  const handleLinkClick = () => {
    // Close mobile sidebar if onClose prop is provided
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <div
      className={`bg-[#2C3E50] text-white h-full p-4 transition-all duration-300 flex flex-col justify-between ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <div>
        <button
          onClick={toggleSidebar}
          className="mb-6 p-2 hover:bg-[#34495E] rounded"
        >
          <Menu />
        </button>

        {/* User Info */}
        <div
          className={`flex items-center gap-3 mb-8 ${
            !isOpen ? "justify-center" : ""
          }`}
        >
          <img
            src={getProfileImage(
              user.profilePicture || "/img/default-profile.png"
            )}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/img/default-profile.png";
            }}
          />
          {isOpen && (
            <div>
              <div className="font-semibold text-sm">
                {user.fullName || user.username || "No Name"}
              </div>
              <div className="text-xs text-gray-300 capitalize">
                {user.role}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.title}>
              <Link
                to={item.url[user.role]}
                onClick={(e) => {
                  console.log("=== LINK CLICKED ===");
                  console.log("Item title:", item.title);
                  console.log("User role:", user.role);

                  handleLinkClick();
                  // Mark notifications as read when clicking on Notifications menu
                  if (item.title === "Notifications" && user.role === "admin") {
                    console.log("=== Notification button clicked ===");
                    console.log("Calling markBookingsAsRead function...");
                    console.log(
                      "markBookingsAsRead function:",
                      markBookingsAsRead
                    );
                    markBookingsAsRead();
                  }
                }}
                className={`flex items-center gap-3 p-2 rounded hover:bg-[#34495E] ${
                  !isOpen ? "justify-center" : ""
                } relative`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {isOpen && <span>{item.title}</span>}
                {/* Show notification badge for admin notifications */}
                {item.title === "Notifications" &&
                  user.role === "admin" &&
                  unreadBookings > 0 && (
                    <span
                      className={`absolute ${
                        isOpen ? "top-0 right-0" : "top-0 right-0"
                      } bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center min-w-[24px] text-[10px] font-bold border-2 border-white shadow-lg transform translate-x-2 -translate-y-2`}
                    >
                      {unreadBookings > 99 ? "99+" : unreadBookings}
                    </span>
                  )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Profile and Sign Out Buttons */}
      <div className="space-y-2">
        {/* Go to Home button for admin */}
        {user.role === "admin" && (
          <Link
            to="/"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#34495E] transition-colors ${
              !isOpen ? "justify-center" : ""
            }`}
          >
            <LayoutDashboard size={18} />
            {isOpen && <span>Go to Home</span>}
          </Link>
        )}
        <Link
          to={
            user.role === "admin" ? "/admin/profile" : "/receptionist/profile"
          }
          onClick={handleLinkClick}
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#34495E] transition-colors ${
            !isOpen ? "justify-center" : ""
          }`}
        >
          <User size={18} />
          {isOpen && <span>Profile</span>}
        </Link>
        <button
          onClick={logout}
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#34495E] w-full ${
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
