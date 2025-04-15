import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Receptionist/Navbar";
import ViewBookings from "./components/Receptionist/ViewBookings";
import BookingDetails from "./components/Receptionist/BookingDetails";

import Home from "./pages/Receptionist/Home";
import RoomsList from "./pages/Receptionist/RoomsList";
// import AddRoom from "./pages/Receptionist/AddRoom";
import Profile from "./pages/Receptionist/Profile";
import RoomDetails from "./pages/Receptionist/RoomDetails";
import BookingPage from "./pages/Receptionist/BookingPage";
import ConfirmationPage from "./pages/Receptionist/ConfirmationPage";



export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/rooms" element={<RoomsList />} /> */}
        {/* <Route path="/add-room" element={<AddRoom />} /> */}
        <Route path="/profile" element={<Profile />} />
        {/* <Route path="/rooms/:id" element={<RoomDetails />} /> */}
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/bookings" element={<ViewBookings />} />
        <Route path="/booking-details/:bookingId" element={<BookingDetails />} />
        
      </Routes>
    </Router>
  );
}
