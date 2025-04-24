import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Receptionist/Navbar";

import Home from "./pages/Receptionist/Home";
import Profile from "./pages/Receptionist/Profile";
import BookingPage from "./pages/Receptionist/BookingPage";
import ConfirmationPage from "./pages/Receptionist/ConfirmationPage";
import BookingsListPage from './pages/Receptionist/BookingsListPage';
import BookingDetailsPage from './pages/Receptionist/BookingDetailsPage';
import BookingCalendar from "./pages/Receptionist/BookingCalendar";



export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/bookings" element={<BookingsListPage />} />
        <Route path="/bookings/:id" element={<BookingDetailsPage />} />
        <Route path="/calendar" element={<BookingCalendar />} />
        {/* Add more routes as needed */}
        
      </Routes>
    </Router>
  );
}
