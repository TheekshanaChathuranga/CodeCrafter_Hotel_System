import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ViewBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Added navigate hook

  useEffect(() => {
    axios.get("http://localhost:5000/api/bookings")
      .then((response) => {
        setBookings(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching bookings:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between mb-6">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer"
          onClick={() => alert("Online Booking Clicked")}
        >
          Online Booking
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
          onClick={() => navigate("/bookings")}
        >
          Manual Booking
        </button>
      </div>
      <h2 className="text-2xl font-bold text-center mb-4">All Bookings</h2>

      {bookings.length === 0 ? <p>No bookings found.</p> : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="p-4 bg-gray-100 rounded-lg flex justify-between items-center">
              <div>
                <p><strong>Guest:</strong> {booking.adminDetails.name}</p>
                <p><strong>Room No:</strong> {booking.selectedRoom.roomNumber}</p>
                <p><strong>Check-in:</strong> {new Date(booking.adminDetails.checkIn).toLocaleString()}</p>
                <p><strong>Check-out:</strong> {new Date(booking.adminDetails.checkOut).toLocaleString()}</p>
              </div>
              <Link 
                to={`/booking-details/${booking._id}`} 
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
