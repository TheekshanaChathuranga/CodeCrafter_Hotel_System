import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ViewBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchRoom, setSearchRoom] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/bookings")
      .then((response) => {
        if (response.status === 200) {
          setBookings(response.data);
        } else {
          throw new Error("Failed to fetch bookings");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching bookings:", error);
        alert("❌ Failed to load bookings. Please try again.");
        setLoading(false);
      });
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    // Ensure selectedRoom and roomNumber exist before filtering
    return booking.selectedRoom?.roomNumber?.toString().includes(searchRoom);
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      {/* Header Buttons */}
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

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Room Number"
          value={searchRoom}
          onChange={(e) => setSearchRoom(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-center mb-4">All Bookings</h2>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="p-4 bg-gray-100 rounded-lg flex justify-between items-center"
            >
              <div>
                <p><strong>Guest:</strong> {booking.adminDetails?.name || "N/A"}</p>
                <p>
                  <strong>Check-in:</strong>{" "}
                  {booking.adminDetails?.checkIn
                    ? new Date(booking.adminDetails.checkIn).toLocaleString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Check-out:</strong>{" "}
                  {booking.adminDetails?.checkOut
                    ? new Date(booking.adminDetails.checkOut).toLocaleString()
                    : "N/A"}
                </p>
                <p><strong>Package:</strong> {booking.packageType || "N/A"}</p>
                <p><strong>Room No:</strong> {booking.selectedRoom?.roomNumber || "N/A"}</p> {/* Display room number */}
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
