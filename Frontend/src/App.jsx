import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Receptionist/Navbar";

import Home from "./pages/Receptionist/Home";
import PoolBooking from "./pages/Receptionist/PoolBooking";




export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pool-booking" element={<PoolBooking />} />
        {/* Add more routes as needed */}

        
      </Routes>
    </Router>
  );
}
