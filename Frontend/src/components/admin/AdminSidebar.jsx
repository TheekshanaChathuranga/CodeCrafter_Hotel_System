import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Hotel, Users, Menu, Waves, LifeBuoy, CalendarCheck, User, User2Icon, UserCheck, Settings } from "lucide-react";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { title: "Rooms", url: "/admin/rooms", icon: <Hotel size={18} /> },
    { title: "Pools", url: "/admin/pools", icon: <LifeBuoy size={18} /> },
    { title: "Reservations", url: "/admin/rooms", icon: <CalendarCheck size={18} /> },
    { title: "Users", url: "/admin/rooms", icon: <UserCheck size={18} /> },
    { title: "Settings", url: "/admin/rooms", icon: <Settings size={18} /> },
  ];

  return (
    <div 
      className={`bg-[#2C3E50] text-white h-full p-4 transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}
      style={{ backgroundColor: '#2C3E50' }}
    >
      <button 
        onClick={toggleSidebar} 
        className="mb-6 p-2 hover:bg-[#34495E] rounded"
        style={{ color: '#ECF0F1' }}
      >
        <Menu />
      </button>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.title}>
            <Link 
              to={item.url}
              className={`flex items-center gap-3 p-2 rounded hover:bg-[#34495E] ${!isOpen ? "justify-center" : ""}`}
              style={{ color: '#ECF0F1' }}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {isOpen && <span>{item.title}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminSidebar;