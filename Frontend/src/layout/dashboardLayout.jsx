import React from "react";
import { Outlet } from 'react-router-dom';
import DashboardSidebar from "../components/DashboardSidebar";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet /> {/* This will show rooms/pools content */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;