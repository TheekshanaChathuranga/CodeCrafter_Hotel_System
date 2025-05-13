import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardLayout from "./layout/dashboardLayout";
import ManagePools from "./pages/admin/PoolManagement";
import ManageRooms from "./pages/admin/RoomManagement";
import ManageUsers from "./pages/admin/UserManagement";
import ProtectedRoute from "./components/protectedRoute";
import ReservationCalendar from "./pages/admin/AdminReservationCalendar";
import BookingConfirmation from "./pages/admin/BookingConfirmationManagement";
import BookingConfirmationDetails from "./pages/admin/BookingConfirmationDetails";


// import RoomBooking from "./pages/reception/RoomBooking";
// import PoolsBooking from "./pages/reception/PoolsBooking";

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isReceptionRoute = location.pathname.startsWith("/reception");

  return (
    <div>
      {(!isAdminRoute && !isReceptionRoute) && <Navbar />}

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
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManageRooms />} />
          <Route path="rooms" element={<ManageRooms />} />
          <Route path="pools" element={<ManagePools />} />
          <Route path="reservations" element={<ReservationCalendar />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="bookingNotifications" element={<BookingConfirmation />} />
          <Route path="bookingNotifications/:id" element={<BookingConfirmationDetails />} />
        </Route>

        {/* Reception routes */}
        <Route 
          path="/reception" 
          element={
            <ProtectedRoute allowedRoles={['reception']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManageRooms />} />
          <Route path="rooms" element={<ManageRooms />} />
          <Route path="pools" element={<ManagePools />} />
        </Route>

      </Routes>
    </div>
  );
};

export default App;
