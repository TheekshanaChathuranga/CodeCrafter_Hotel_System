import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
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

  // Helper function to safely get check-in/out dates from booking
  const getBookingDates = (booking) => {
    if (!booking) return { checkIn: null, checkOut: null };

    const checkIn = booking.dates?.checkIn || booking.checkIn;
    const checkOut = booking.dates?.checkOut || booking.checkOut;

    return { checkIn, checkOut };
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        // Get user token and decode for userId
        const token =
          localStorage.getItem("userToken") ||
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("jwt");

        if (!token) {
          throw new Error("Please log in to view your bookings");
        }

        const decoded = jwtDecode(token);
        const userId =
          decoded.userId || decoded.id || decoded._id || decoded.sub;

        if (!userId) {
          throw new Error(
            "Unable to identify user. Please try logging in again."
          );
        }

        // Fetch bookings from backend
        const response = await axios.get(
          `http://localhost:5000/api/user-bookings/user/${userId}`
        );
        console.log("Received bookings:", response.data); // Debug log

        // Ensure we have valid data before setting state
        if (Array.isArray(response.data)) {
          const validBookings = response.data
            .filter((booking) => {
              if (!booking) return false;
              const { checkIn, checkOut } = getBookingDates(booking);
              return checkIn && checkOut && booking.roomNumber;
            })
            .map((booking) => {
              // Normalize the booking structure
              const { checkIn, checkOut } = getBookingDates(booking);
              return {
                ...booking,
                dates: { checkIn, checkOut },
              };
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          if (validBookings.length === 0 && response.data.length > 0) {
            console.warn("No valid bookings found in response:", response.data);
            setError(
              "Your booking data appears to be incomplete. Please contact support."
            );
          }

          setBookings(validBookings);
        } else {
          console.error("Unexpected data format:", response.data);
          setError(
            "Received invalid booking data from server. Please try again later."
          );
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load your bookings";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Calculate booking status based on dates
  const getBookingStatus = (checkIn, checkOut) => {
    try {
      const now = new Date();
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        return "Unknown";
      }

      if (now < checkInDate) return "Upcoming";
      if (now > checkOutDate) return "Completed";
      return "Active";
    } catch (err) {
      console.error("Error calculating booking status:", err);
      return "Unknown";
    }
  };

  // Booking Details Modal
  const BookingDetailsModal = ({ booking, onClose }) => {
    if (!booking) return null;

    const { checkIn, checkOut } = getBookingDates(booking);
    const status = getBookingStatus(checkIn, checkOut);
    const statusColors = {
      Upcoming: "bg-blue-100 text-blue-800",
      Active: "bg-green-100 text-green-800",
      Completed: "bg-gray-100 text-gray-800",
      Unknown: "bg-yellow-100 text-yellow-800",
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-2 transform transition-all scale-95 max-h-[90vh] overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Booking Details
              </h2>
              <span
                className={`px-2.5 py-1 rounded-full text-sm ${statusColors[status]}`}
              >
                {status}
              </span>
            </div>

            <div className="space-y-4">
              {/* Primary Info */}
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-3">
                  {booking.bookingId && (
                    <div>
                      <p className="text-sm text-gray-600">Booking ID</p>
                      <p className="font-semibold text-gray-800">
                        {booking.bookingId}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Room Number</p>
                    <p className="font-semibold text-gray-800">
                      {booking.roomNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Room Type</p>
                    <p className="font-semibold text-gray-800">
                      {booking.roomType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Booked On</p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(booking.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stay Details */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Stay Duration
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Check-in</p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(checkIn)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Check-out</p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(checkOut)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Guest Details */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Guest Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-semibold text-gray-800">
                      {booking.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-semibold text-gray-800">
                      {booking.phoneNumber}
                    </p>
                  </div>
                  {booking.nicNumber && (
                    <div>
                      <p className="text-sm text-gray-600">NIC Number</p>
                      <p className="font-semibold text-gray-800">
                        {booking.nicNumber}
                      </p>
                    </div>
                  )}
                  {booking.whatsappNumber && (
                    <div>
                      <p className="text-sm text-gray-600">WhatsApp</p>
                      <p className="font-semibold text-gray-800">
                        {booking.whatsappNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Occupancy Details */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Occupancy Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Adults</p>
                    <p className="font-semibold text-gray-800">
                      {booking.adults}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Children</p>
                    <p className="font-semibold text-gray-800">
                      {booking.children}
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {booking.specialRequests && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Special Requests
                  </h3>
                  <p className="text-gray-800 text-sm">
                    {booking.specialRequests}
                  </p>
                </div>
              )}

              {/* Receipt Document */}
              {booking.document && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="font-semibold text-gray-800 mb-2">Receipt</h3>
                  <a
                    href={`http://localhost:5000${booking.document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Receipt
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex justify-end sticky bottom-0 pt-2 bg-white border-t">
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-4">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
              <p className="text-gray-600">
                View and manage your room reservations
              </p>
            </div>
            <button
              onClick={() => navigate("/room-booking")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Book Another Room
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Bookings Found
            </h3>
            <p className="text-gray-600 mb-4">
              You haven't made any room bookings yet.
            </p>
            <button
              onClick={() => navigate("/room-booking")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book Your First Room
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => {
              const { checkIn, checkOut } = getBookingDates(booking);
              const status = getBookingStatus(checkIn, checkOut);

              const statusColors = {
                Upcoming: "bg-blue-100 text-blue-800",
                Active: "bg-green-100 text-green-800",
                Completed: "bg-gray-100 text-gray-800",
                Unknown: "bg-yellow-100 text-yellow-800",
              };

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Room {booking.roomNumber}
                        </h3>
                        <p className="text-gray-600">{booking.roomType}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${statusColors[status]}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Stay Duration</p>
                        <p className="font-medium text-gray-800">
                          {formatDate(checkIn)} - {formatDate(checkOut)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Booked On</p>
                        <p className="font-medium text-gray-800">
                          {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="mt-4 w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

export default MyBookings;