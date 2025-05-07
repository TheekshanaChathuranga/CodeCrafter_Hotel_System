import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Receptionist/Home";
import Navbar from "./components/Receptionist/Navbar";
import PoolBooking from "./components/Receptionist/PoolBooking";
import BookingsList from "./components/Receptionist/BookingsList";


const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pool-booking" element={<PoolBooking />} />
          <Route path="/Pool-bookings" element={<BookingsList />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
