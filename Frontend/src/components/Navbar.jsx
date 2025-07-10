import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <h1 className="text-lg font-bold">Hotel Management</h1>
        <div>
          <Link className="mr-4 hover:text-gray-300" to="/">Home</Link>
          <Link className="mr-4 hover:text-gray-300" to="/about">About</Link>
          <Link className="mr-4 hover:text-gray-300" to="/event-booking">Event Booking</Link>
          <Link className="mr-4 hover:text-gray-300" to="/event-list">Event List</Link>
          <Link className="mr-4 hover:text-gray-300" to="/client-booking">Client Booking</Link>
          <Link className="hover:text-gray-300" to="/contact">Contact</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
