import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-[#2C3E50] p-4 text-[#ECF0F1]">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left Side - TheLake Dashboard */}
        <h1 className="text-lg font-bold">TheLake Dashboard</h1>

        {/* Right Side - Profile */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-[#16A085]">Home</Link>
          <Link to="/rooms" className="hover:text-[#16A085]">Rooms</Link>
          <Link to="/add-room" className="hover:text-[#16A085]">Add Room</Link>

          {/* Profile Image (Click to go to Profile Page) */}
          <img 
            src="/assets/react.svg" 
            alt="Profile" 
            className="w-10 h-10 rounded-full cursor-pointer" 
            onClick={() => navigate("/profile")}
          />
        </div>
      </div>
    </nav>
  );
}
