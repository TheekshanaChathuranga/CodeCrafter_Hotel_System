import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function BookingDetails() {
  const [booking, setBooking] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ checkIn: "", checkOut: "" });
  const { bookingId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (bookingId) {
      axios
        .get(`http://localhost:5000/api/receptionBookings/${bookingId}`)
        .then((response) => {
          setBooking(response.data);
          setEditData({
            checkIn: new Date(response.data.adminDetails.checkIn)
              .toISOString()
              .slice(0, 16),
            checkOut: new Date(response.data.adminDetails.checkOut)
              .toISOString()
              .slice(0, 16),
          });
        })
        .catch((error) => {
          console.error("Error fetching booking:", error);
          if (error.response && error.response.status === 404) {
            alert("Booking not found.");
            navigate("/receptionist/bookings");
          }
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
      .patch(`http://localhost:5000/api/receptionBookings/${bookingId}`, {
        checkIn: new Date(editData.checkIn).toISOString(),
        checkOut: new Date(editData.checkOut).toISOString(),
      })
      .then(() => {
        alert("Booking updated successfully.");
        setIsEditing(false);
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error updating booking:", error);
        alert("Failed to update booking.");
      });
  };

  const deleteBooking = () => {
    axios
      .delete(`http://localhost:5000/api/receptionBookings/${bookingId}`)
      .then(() => {
        alert("Booking cancelled successfully.");
        navigate("/receptionist/bookings");
      })
      .catch((error) => {
        console.error("Error cancelling booking:", error);
        alert("Failed to delete booking.");
      });
  };

  if (!booking) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-4 sm:px-6 py-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
              📋 Booking Details
            </h2>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg space-y-3 sm:space-y-4">
              {/* Guest Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  👤 Guest Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Guest Name:
                    </span>
                    <p className="text-gray-900 font-medium">
                      {booking.adminDetails.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Mobile:
                    </span>
                    <p className="text-gray-900 font-medium">
                      {booking.adminDetails.mobile}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-sm font-medium text-gray-600">
                      WhatsApp:
                    </span>
                    <p className="text-gray-900 font-medium">
                      {booking.adminDetails.whatsapp || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Schedule */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  📅 Booking Schedule
                </h3>
                {!isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Check-in:
                      </span>
                      <p className="text-gray-900 font-medium">
                        {new Date(
                          booking.adminDetails.checkIn
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Check-out:
                      </span>
                      <p className="text-gray-900 font-medium">
                        {new Date(
                          booking.adminDetails.checkOut
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-in:
                      </label>
                      <input
                        type="datetime-local"
                        name="checkIn"
                        value={editData.checkIn}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-out:
                      </label>
                      <input
                        type="datetime-local"
                        name="checkOut"
                        value={editData.checkOut}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Room Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  🏠 Room Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Room No:
                    </span>
                    <p className="text-gray-900 font-medium">
                      {booking.selectedRoom.roomNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      AC Type:
                    </span>
                    <p className="text-gray-900 font-medium">
                      {booking.selectedRoom.acType}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              {!isEditing ? (
                <button
                  onClick={handleEditClick}
                  className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  ✏️ Edit Booking
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex-1 sm:flex-none px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  💾 Save Changes
                </button>
              )}

              <button
                onClick={deleteBooking}
                className="flex-1 sm:flex-none px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                🗑️ Cancel Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
