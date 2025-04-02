import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Hotel, Users, Menu } from "lucide-react";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { title: "Rooms", url: "/admin/rooms", icon: <Hotel size={18} /> },
    { title: "Pools", url: "/admin/pools", icon: <Users size={18} /> },
  ];

  return (
    <div className={`bg-gray-900 text-white h-full p-4 transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
      <button onClick={toggleSidebar} className="mb-6 p-2 hover:bg-gray-800 rounded">
        <Menu />
      </button>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.title}>
            <Link 
              to={item.url}
              className={`flex items-center gap-3 p-2 rounded hover:bg-gray-700 ${!isOpen ? "justify-center" : ""}`}
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