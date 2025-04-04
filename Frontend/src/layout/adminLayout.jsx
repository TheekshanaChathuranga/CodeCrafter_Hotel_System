import React from "react";
import { Outlet } from 'react-router-dom';
import AdminSidebar from "../components/admin/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet /> {/* This will show rooms/pools content */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;