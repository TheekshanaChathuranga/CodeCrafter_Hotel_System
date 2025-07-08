// import React from "react";
// import { Link } from "react-router-dom";

// const Navbar = () => {
//   return (
//     <nav className="bg-gray-800 text-white p-4">
//       <div className="container mx-auto flex justify-between">
//         <h1 className="text-lg font-bold">Hotel Management</h1>
//         <div>
//           <Link className="mr-4 hover:text-gray-300" to="/">Home</Link>
//           <Link className="mr-4 hover:text-gray-300" to="/about">About</Link>
//           <Link className="hover:text-gray-300" to="/contact">Contact</Link>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
// components/Navbar.js
// components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img src="/src/img/logo.jpg" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">Lake Resort</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link to ="/" className="hover:text-blue-400 transition-colors ">Home</Link>
            <Link to="/room-booking" className="hover:text-blue-400 transition-colors">Room Booking</Link>
            <Link to="/pool-booking" className="hover:text-blue-400 transition-colors">Pool Booking</Link>
            <Link to="/event-booking" className="hover:text-blue-400 transition-colors">Event Booking</Link>
            <Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-blue-400 transition-colors">Contact</Link>
          </div>

          {/* Mobile Menu Button (optional) */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-white hover:bg-gray-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;