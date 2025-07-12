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
import ClientBooking from "./pages/ClientBooking";
import Menu from "./pages/Menu";
import MenuCardManagement from "./pages/MenuCardManagement";

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
          <Route path="/client-booking" element={<ClientBooking />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu-card-management" element={<MenuCardManagement />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
