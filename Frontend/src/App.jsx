import React from "react";
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

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
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
};

export default App;