import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "../../components/Navbar";

const MyPoolBookings = () => {
  const navigate = useNavigate();
  const [poolBookings, setPoolBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Helper function to safely format dates
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString();
    } catch (err) {
      console.error("Error formatting date:", date, err);
      return "Invalid Date";
    }
  };

  // Helper function to safely format time
  const formatTime = (time) => {
    if (!time) return "N/A";
    return time;
  };

  useEffect(() => {
    const fetchPoolBookings = async () => {
      try {
        setLoading(true);
        // Get user token and decode for userId
        const token =
          localStorage.getItem("userToken") ||
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("jwt");

        if (!token) {
          throw new Error("Please log in to view your pool bookings");
        }

        const decoded = jwtDecode(token);
        const userId =
          decoded.userId || decoded.id || decoded._id || decoded.sub;

        if (!userId) {
          throw new Error(
            "Unable to identify user. Please try logging in again."
          );
        }

        // Fetch pool bookings from backend
        const response = await axios.get(
          `http://localhost:5000/api/pool-booking/user/${userId}`
        );
        console.log("Received pool bookings:", response.data);

        // Ensure we have valid data before setting state
        if (Array.isArray(response.data)) {
          const validBookings = response.data
            .filter((booking) => booking && booking.date)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setPoolBookings(validBookings);
        } else {
          console.error("Unexpected data format:", response.data);
          setError(
            "Received invalid pool booking data from server. Please try again later."
          );
        }
      } catch (err) {
        console.error("Error fetching pool bookings:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load pool bookings. Please try again later.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPoolBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const openBookingDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const closeBookingDetails = () => {
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading your pool bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
              <h3 className="font-bold">Error</h3>
              <p>{error}</p>
              <button
                onClick={() => navigate("/")}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                My Pool Reservations
              </h1>
              <button
                onClick={() => navigate("/pool-booking")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book New Pool
              </button>
            </div>

            {poolBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-24 w-24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No pool reservations found
                </h3>
                <p className="text-gray-500 mb-6">
                  You haven't made any pool bookings yet.
                </p>
                <button
                  onClick={() => navigate("/pool-booking")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Make Your First Pool Booking
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {poolBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openBookingDetails(booking)}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.poolId?.name || "Pool Booking"}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status || "Pending"}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span className="font-medium">
                            {formatDate(booking.date)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time:</span>
                          <span className="font-medium">
                            {formatTime(booking.checkInTime)} - {formatTime(booking.checkOutTime)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Guests:</span>
                          <span className="font-medium">
                            {booking.guestCount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Booked:</span>
                          <span className="font-medium">
                            {formatDate(booking.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openBookingDetails(booking);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Pool Booking Details
                  </h2>
                  <button
                    onClick={closeBookingDetails}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Booking Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Pool Name</label>
                        <p className="text-gray-900">{selectedBooking.poolId?.name || "N/A"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Booking Date</label>
                        <p className="text-gray-900">{formatDate(selectedBooking.date)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Check-in Time</label>
                        <p className="text-gray-900">{formatTime(selectedBooking.checkInTime)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Check-out Time</label>
                        <p className="text-gray-900">{formatTime(selectedBooking.checkOutTime)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
                        <p className="text-gray-900">{selectedBooking.guestCount}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            selectedBooking.status
                          )}`}
                        >
                          {selectedBooking.status || "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <p className="text-gray-900">{selectedBooking.fullName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <p className="text-gray-900">{selectedBooking.phoneNumber}</p>
                      </div>
                      {selectedBooking.whatsappNumber && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                          <p className="text-gray-900">{selectedBooking.whatsappNumber}</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Booking Date</label>
                        <p className="text-gray-900">{formatDate(selectedBooking.createdAt)}</p>
                      </div>
                    </div>

                    {selectedBooking.request && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Special Requests</label>
                        <p className="text-gray-900 mt-1">{selectedBooking.request}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedBooking.poolId && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Pool Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Pool Description</label>
                        <p className="text-gray-900">{selectedBooking.poolId.description || "N/A"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Capacity</label>
                        <p className="text-gray-900">{selectedBooking.poolId.capacity || "N/A"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Opening Hours</label>
                        <p className="text-gray-900">
                          {selectedBooking.poolId.openingTime} - {selectedBooking.poolId.closingTime}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <p className="text-gray-900">{selectedBooking.poolId.poolStatus || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    onClick={closeBookingDetails}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => navigate("/pool-booking")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Book Another Pool
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© 2025 The Lake Hotel & Resort. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MyPoolBookings;
