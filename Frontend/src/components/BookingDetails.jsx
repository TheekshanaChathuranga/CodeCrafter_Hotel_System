import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function BookingDetails() {
  const [booking, setBooking] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ checkIn: "", checkOut: "" });
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (bookingId) {
      axios
        .get(`http://localhost:5000/api/bookings/${bookingId}`) // Ensure the endpoint includes bookingId
        .then((response) => {
          if (response.status === 200) {
            setBooking(response.data);
            setEditData({
              checkIn: new Date(response.data.adminDetails.checkIn).toISOString().slice(0, 16),
              checkOut: new Date(response.data.adminDetails.checkOut).toISOString().slice(0, 16),
            });
          } else {
            throw new Error("Failed to fetch booking details");
          }
        })
        .catch((error) => {
          console.error("Error fetching booking:", error);
          alert("❌ Failed to load booking details. Please try again.");
          navigate("/bookings"); // Navigate back to bookings if an error occurs
        });
    }
  }, [bookingId, navigate]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    axios
      .put(`http://localhost:5000/api/bookings/${bookingId}`, {
        checkIn: new Date(editData.checkIn).toISOString(),
        checkOut: new Date(editData.checkOut).toISOString(),
      })
      .then((response) => {
        if (response.status === 200) {
          alert("✅ Booking updated successfully.");
          setIsEditing(false);
          window.location.reload();
        } else {
          throw new Error("Failed to update booking");
        }
      })
      .catch((error) => {
        console.error("Error updating booking:", error);
        alert("❌ Failed to update booking. Please try again.");
      });
  };

  const confirmDelete = () => {
    axios.delete(`http://localhost:5000/api/bookings/${bookingId}`)
      .then(() => {
        alert("Booking cancelled successfully.");
        navigate("/bookings");
      })
      .catch((error) => {
        console.error("Error cancelling booking:", error);
        alert("Failed to delete booking.");
      });
  };

  const handleCancelClick = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  if (!booking) return <div>Loading...</div>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Booking Details</h2>

      <div className="bg-gray-100 p-4 rounded-lg">
        <p><strong>Guest Name:</strong> {booking.adminDetails?.name || "N/A"}</p>
        <p><strong>Mobile:</strong> {booking.adminDetails?.mobile || "N/A"}</p>
        <p><strong>Email:</strong> {booking.adminDetails?.email || "N/A"}</p>
        <p><strong>WhatsApp:</strong> {booking.adminDetails?.whatsapp || "N/A"}</p>
        {!isEditing ? (
          <>
            <p><strong>Check-in:</strong> {booking.adminDetails?.checkIn ? new Date(booking.adminDetails.checkIn).toLocaleString() : "N/A"}</p>
            <p><strong>Check-out:</strong> {booking.adminDetails?.checkOut ? new Date(booking.adminDetails.checkOut).toLocaleString() : "N/A"}</p>
          </>
        ) : (
          <>
            <label>Check-in: </label>
            <input
              type="datetime-local"
              name="checkIn"
              value={editData.checkIn}
              onChange={handleChange}
              className="block w-full p-2 mt-2 border rounded-lg"
            />
            <label>Check-out: </label>
            <input
              type="datetime-local"
              name="checkOut"
              value={editData.checkOut}
              onChange={handleChange}
              className="block w-full p-2 mt-2 border rounded-lg"
            />
          </>
        )}
        <p><strong>Room No:</strong> {booking.selectedRoom?.roomNumber || "N/A"}</p>
        <p><strong>AC Type:</strong> {booking.selectedRoom?.acType || "N/A"}</p>
        <p><strong>Package:</strong> {booking.packageType || "N/A"}</p>
        <p><strong>Payment Type:</strong> {booking.paymentDetails?.paymentType || "N/A"}</p>
        <p><strong>Advance Amount:</strong> Rs {booking.paymentDetails?.advanceAmount || "N/A"}</p>
        <p><strong>Remaining Amount:</strong> Rs {booking.paymentDetails?.remainingAmount || "N/A"}</p>
        <p><strong>Total Amount:</strong> Rs {booking.paymentDetails?.totalAmount || "N/A"}</p>
      </div>

      {!isEditing ? (
        <button onClick={handleEditClick} className="mt-5 px-6 py-2 bg-blue-500 text-white rounded-lg">
          Edit Booking
        </button>
      ) : (
        <button onClick={handleSave} className="mt-5 px-6 py-2 bg-green-500 text-white rounded-lg">
          Save Changes
        </button>
      )}
      
      <button onClick={handleCancelClick} className="mt-5 ml-2 px-6 py-2 bg-red-500 text-white rounded-lg">
        Cancel Booking
      </button>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="mb-4">Are you sure you want to cancel this booking?</p>
            <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg mr-2">
              Yes, Cancel
            </button>
            <button onClick={closePopup} className="px-4 py-2 bg-gray-300 rounded-lg">
              No, Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
