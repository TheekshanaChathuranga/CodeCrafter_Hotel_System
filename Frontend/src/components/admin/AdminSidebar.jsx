import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Hotel, Users, Menu, Waves, LifeBuoy,
  CalendarCheck, UserCheck, Settings, LogOut, User
} from "lucide-react";
import { useAuth } from "../../context/UserAuthContext";



const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { title: "Rooms", url: "/admin/rooms", icon: <Hotel size={18} /> },
    { title: "Pools", url: "/admin/pools", icon: <LifeBuoy size={18} /> },
    { title: "Reservations", url: "/admin/reservations", icon: <CalendarCheck size={18} /> },
    { title: "Users", url: "/admin/users", icon: <UserCheck size={18} /> },
    { title: "Settings", url: "/admin/settings", icon: <Settings size={18} /> },
  ];

  return (
    <div
      className={`bg-[#2C3E50] text-white h-full p-4 transition-all duration-300 flex flex-col justify-between ${isOpen ? "w-64" : "w-16"}`}
    >
      <div>
        <button
          onClick={toggleSidebar}
          className="mb-6 p-2 hover:bg-[#34495E] rounded"
        >
          <Menu />
        </button>

        {/* User Info */}
        <div className={`flex items-center gap-3 mb-8 ${!isOpen ? "justify-center" : ""}`}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4g_2Qj3LsNR-iqUAFm6ut2EQVcaou4u2YXw&s"
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
          {isOpen && (
            <div>
              <div className="font-semibold">{user.username}</div>
              <div className="text-sm text-gray-300">{user.role}</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.title}>
              <Link
                to={item.url}
                className={`flex items-center gap-3 p-2 rounded hover:bg-[#34495E] ${!isOpen ? "justify-center" : ""}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {isOpen && <span>{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Profile and Sign Out Buttons */}
      <div className="space-y-2">
        <Link
          to="/admin/profile"
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#34495E] ${!isOpen ? "justify-center" : ""}`}
        >
          <User size={18} />
          {isOpen && <span>Profile</span>}
        </Link>
        <button
          onClick={logout}
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#34495E] w-full ${!isOpen ? "justify-center" : ""}`}
        >
          <LogOut size={18} />
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
