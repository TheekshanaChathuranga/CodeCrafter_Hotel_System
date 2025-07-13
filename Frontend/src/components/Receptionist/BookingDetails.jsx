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
    <div className="min-h-screen bg-blue-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-4 sm:px-6 py-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
              Booking Details
            </h2>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Guest Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 border-b border-blue-200 pb-2">
                  Guest Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Guest Name</label>
                    <div className="bg-white p-2 rounded border text-gray-900">
                      {booking.adminDetails.name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile</label>
                    <div className="bg-white p-2 rounded border text-gray-900">
                      {booking.adminDetails.mobile}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                    <div className="bg-white p-2 rounded border text-gray-900">
                      {booking.adminDetails.whatsapp || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Information */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-800 mb-3 border-b border-purple-200 pb-2">
                  Room Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Room Number</label>
                    <div className="bg-white p-2 rounded border text-gray-900">
                      {booking.selectedRoom.roomNumber}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">AC Type</label>
                    <div className="bg-white p-2 rounded border text-gray-900">
                      {booking.selectedRoom.acType}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Schedule */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                Booking Schedule
              </h3>
              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Check-in</label>
                    <div className="bg-white p-2 rounded border text-gray-900">
                      {new Date(booking.adminDetails.checkIn).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Check-out</label>
                    <div className="bg-white p-2 rounded border text-gray-900">
                      {new Date(booking.adminDetails.checkOut).toLocaleString()}
                    </div>
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              {!isEditing ? (
                <button
                  onClick={handleEditClick}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Edit Booking
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Save Changes
                </button>
              )}

              <button
                onClick={deleteBooking}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
