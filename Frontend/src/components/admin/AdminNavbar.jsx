import React from "react";

const AdminNavbar = () => {
  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
      <h1 className="text-xl font-bold">Hotel Management</h1>
      <button className="bg-white text-blue-600 px-4 py-2 rounded-md">
        Logout
      </button>
    </nav>
  );
};

export default AdminNavbar;
