import React from "react";

import Profile from "./pages/Profile";
import RoomDetails from "./pages/RoomDetails";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import ViewBookings from "./components/ViewBookings";
import BookingDetails from "./components/BookingDetails";

import { Routes, Route } from "react-router-dom"; // Removed Router import
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLayout from "./layout/adminLayout";
import ManagePools from "./pages/admin/PoolManagement";
import ManageRooms from "./pages/admin/RoomManagement";
import ProtectedRoute from "./components/protectedRoute";


<<<<<<< HEAD
export default function App() {
=======
const App = () => {
>>>>>>> c14f77bbefb760989602ec8c9898b5b7c2ec0e2d
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/bookings" element={<ViewBookings />} />
        <Route path="/booking-details/:bookingId" element={<BookingDetails />} />
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
        </Route>

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
        </Route>
        
      </Routes>
    </div>
  );
};


