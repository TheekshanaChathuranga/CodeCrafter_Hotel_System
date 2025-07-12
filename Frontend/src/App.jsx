import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EventBooking from "./pages/EventBooking";
import EventList from "./pages/EventList";
import MenuManagement from "./pages/MenuManagement";
import ClientBooking from "./pages/ClientBooking";

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/event-booking" element={<EventBooking />} />
          <Route path="/event-list" element={<EventList />} />
          <Route path="/menu-management" element={<MenuManagement />} />
          <Route path="/client-booking" element={<ClientBooking />} />
          <Route path="/" element={<EventBooking />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
