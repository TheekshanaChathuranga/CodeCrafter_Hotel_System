import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Receptionist/Navbar";

import Home from "./pages/Receptionist/Home";
import BookingsList from "./components/Receptionist/BookingsList";
import BookingForm from "./components/Receptionist/BookingForm";




export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pool-booking" element={<BookingForm />} />
        <Route path="/bookings" element={<BookingsList />} />
        {/* Add more routes as needed */}

        
      </Routes>
    </Router>
  );
}
