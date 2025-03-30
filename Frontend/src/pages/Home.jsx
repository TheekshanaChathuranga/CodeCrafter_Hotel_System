import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h2 className="text-center text-3xl font-bold text-gray-800 mb-8">
        Welcome to the Hotel Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Room Booking</h3>
          <button className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition" onClick={() => navigate("/booking")}>
            Book Now
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">View All Bookings</h3>
          <button className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition" onClick={() => navigate("/bookings")}>
            View Bookings
          </button>
        </div>
      </div>
    </div>
  );
}
