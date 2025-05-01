import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLayout from "./layout/adminLayout";
import ManagePools from "./pages/admin/PoolManagement";
import ManageRooms from "./pages/admin/RoomManagement";
import ProtectedRoute from "./components/protectedRoute";
import ReservationCalendar from "./pages/admin/AdminReservationCalendar";

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div>
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManageRooms />} />
          <Route path="rooms" element={<ManageRooms />} />
          <Route path="pools" element={<ManagePools />} />
          <Route path="reservations" element={<ReservationCalendar />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
