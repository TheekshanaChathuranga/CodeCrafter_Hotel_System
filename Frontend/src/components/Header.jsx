import React from "react";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Routes } from "react-router-dom";





export default function Header() {
  return (
    <div>
      <header className="bg-gray-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo / Title */}
          <h1 className="text-2xl font-bold">The Lake & Resorts</h1>

          {/* Navigation */}
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="hover:text-gray-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/room-booking" className="hover:text-gray-300">
                  Room Booking
                </Link>
              </li>
              <li>
                <Link to="/pool-booking" className="hover:text-gray-300">
                  Pool Booking
                </Link>
              </li>
              <li>
                <Link to="/event-booking" className="hover:text-gray-300">
                  Event Booking
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gray-300">
                  About Us
                </Link>
              </li>
              
            </ul>
          </nav>
        </div>
      </header>
    </div>
  );
}
