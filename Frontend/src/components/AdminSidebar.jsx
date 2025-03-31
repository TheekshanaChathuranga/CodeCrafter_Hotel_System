import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Inbox, Search, Settings, Menu, ChartArea } from "lucide-react";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    // { title: "Analytics", url: "/admin/analytics", icon: <ChartArea /> },
    // { title: "Inbox", url: "/admin/inbox", icon: <Inbox /> },
    { title: "Rooms", url: "/admin/rooms", icon: <Home /> }, // Updated link
    // { title: "Search", url: "/admin/search", icon: <Search /> },
    // { title: "Settings", url: "/admin/settings", icon: <Settings /> },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className={`bg-gray-900 text-white h-screen p-5 transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
        <button onClick={toggleSidebar} className="mb-6 p-2 text-white">
          <Menu />
        </button>
        <ul>
          {menuItems.map((item) => (
            <li key={item.title} className="flex items-center gap-3 p-3 hover:bg-gray-700">
              {item.icon}
              {isOpen && <Link to={item.url}>{item.title}</Link>} {/* Use Link for navigation */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminSidebar;
