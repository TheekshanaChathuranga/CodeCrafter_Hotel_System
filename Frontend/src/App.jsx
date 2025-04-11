import React, { useEffect, useState } from "react";
import axios from "axios";

import Profile from "./pages/Profile";
import RoomDetails from "./pages/RoomDetails";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import ViewBookings from "./components/ViewBookings";
import BookingDetails from "./components/BookingDetails";

import { Routes, Route } from "react-router-dom"; // Removed Router import
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLayout from "./layout/adminLayout";
import ManageRooms from "./pages/admin/ManageRooms";
import ManagePools from "./pages/admin/ManagePools";
import ProtectedRoute from "./components/protectedRoute";

export default function App() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/rooms")
      .then(response => setRooms(response.data))
      .catch(error => console.error("Error fetching rooms:", error));
  }, []);

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/rooms" element={<RoomsList rooms={rooms} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/bookings" element={<ViewBookings />} />
        <Route path="/booking-details/:bookingId" element={<BookingDetails />} />
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
        </Route>
        
      </Routes>
    </div>
  );
}

