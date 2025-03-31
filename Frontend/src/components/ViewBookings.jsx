import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ViewBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/bookings")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setBookings(response.data);
        } else {
          console.error("Response is not an array:", response.data);
          setBookings([]); // Ensure state is set even if the response is unexpected
        }
      })
      .catch((error) => {
        console.error("Error fetching bookings:", error);
      })
      .finally(() => setLoading(false)); // Ensures loading is set to false in all cases
  }, []);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">All Bookings</h2>

      {bookings.length === 0 ? (
        <p className="text-center">No bookings found.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="p-4 bg-gray-100 rounded-lg flex justify-between items-center">
              <div>
                <p><strong>Guest:</strong> {booking.adminDetails?.name || "N/A"}</p>
                <p><strong>Room No:</strong> {booking.selectedRoom?.roomNumber || "N/A"}</p>
                <p><strong>Check-in:</strong> {booking.adminDetails?.checkIn ? new Date(booking.adminDetails.checkIn).toLocaleString() : "N/A"}</p>
                <p><strong>Check-out:</strong> {booking.adminDetails?.checkOut ? new Date(booking.adminDetails.checkOut).toLocaleString() : "N/A"}</p>
              </div>
              <Link to={`/booking-details/${booking._id}`} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
