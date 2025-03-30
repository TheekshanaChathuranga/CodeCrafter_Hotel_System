import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ViewBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/bookings")
      .then((response) => {
        // Ensure the response is an array and update the state
        if (Array.isArray(response.data)) {
          setBookings(response.data);
        } else {
          console.error("Response is not an array:", response.data);
        }
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
      <h2 className="text-2xl font-bold text-center mb-4">All Bookings</h2>

      {bookings.length === 0 ? <p>No bookings found.</p> : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="p-4 bg-gray-100 rounded-lg flex justify-between items-center">
              <div>
                <p><strong>Guest:</strong> {booking.name}</p>
                <p><strong>Room No:</strong> {booking.roomNumber}</p>
                <p><strong>Check-in:</strong> {new Date(booking.checkIn).toLocaleString()}</p>
                <p><strong>Check-out:</strong> {new Date(booking.checkOut).toLocaleString()}</p>
              </div>
              <Link to={`/booking-details/${booking._id}`} className="px-6 py-2 bg-blue-500 text-white rounded-lg">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
