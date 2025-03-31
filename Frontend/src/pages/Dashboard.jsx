import React from "react";
import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";

const Dashboard = () => {
  return (
    
    <div className= "flex h-screen bg-gray-100 w-full">
      <AdminSidebar />
      <div className="flex-1">
        <AdminNavbar />
      </div>
    </div>
  );
};

export default Dashboard;
