import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function BookingDetails() {
  const [booking, setBooking] = useState(null);
  const { bookingId } = useParams();  // Get booking ID from URL params
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure bookingId is a valid MongoDB ObjectId format
    if (bookingId) {
      axios.get(`http://localhost:5000/api/bookings/${bookingId}`)
        .then((response) => setBooking(response.data))
        .catch((error) => {
          console.error("Error fetching booking:", error);
          if (error.response && error.response.status === 404) {
            alert("Booking not found.");
            navigate("/bookings");  // Redirect to bookings list if not found
          }
        });
    }
  }, [bookingId, navigate]);

  const deleteBooking = () => {
    axios.delete(`http://localhost:5000/api/bookings/${bookingId}`)
      .then(() => {
        alert("Booking deleted successfully.");
        navigate("/bookings");
      })
      .catch((error) => {
        console.error("Error deleting booking:", error);
        alert("Failed to delete booking.");
      });
  };

  if (!booking) return <div>Loading...</div>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Booking Details</h2>

      <div className="bg-gray-100 p-4 rounded-lg">
        <p><strong>Guest Name:</strong> {booking.adminDetails.name}</p>
        <p><strong>Mobile:</strong> {booking.adminDetails.mobile}</p>
        <p><strong>WhatsApp:</strong> {booking.adminDetails.whatsapp || "N/A"}</p>
        <p><strong>Check-in:</strong> {new Date(booking.adminDetails.checkIn).toLocaleString()}</p>
        <p><strong>Check-out:</strong> {new Date(booking.adminDetails.checkOut).toLocaleString()}</p>
        <p><strong>Room No:</strong> {booking.selectedRoom.roomNumber}</p>
        <p><strong>AC Type:</strong> {booking.selectedRoom.acType}</p>
      </div>

      <button onClick={deleteBooking} className="mt-5 px-6 py-2 bg-red-500 text-white rounded-lg">
        Delete Booking
      </button>
    </div>
  );
}
