import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ManageRooms from "./pages/ManageRooms";
import ManagePools from "./pages/ManagePools"; 

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
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/rooms" element={<ManageRooms />} />
          <Route path="/admin/pools" element={<ManagePools />} /> 

        </Routes>
      </div>
    </Router>
  );
};

export default App;
