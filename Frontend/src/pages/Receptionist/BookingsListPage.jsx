import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/receptionBookings"
        );
        setBookings(response.data);
        setFilteredBookings(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Filter bookings based on status and date
  useEffect(() => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (dateFilter) {
        case "today":
          filtered = filtered.filter((booking) => {
            const checkIn = new Date(
              booking.bookingDetails?.checkIn || booking.checkIn
            );
            const checkInDate = new Date(
              checkIn.getFullYear(),
              checkIn.getMonth(),
              checkIn.getDate()
            );
            return checkInDate.getTime() === today.getTime();
          });
          break;
        case "tomorrow":
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          filtered = filtered.filter((booking) => {
            const checkIn = new Date(
              booking.bookingDetails?.checkIn || booking.checkIn
            );
            const checkInDate = new Date(
              checkIn.getFullYear(),
              checkIn.getMonth(),
              checkIn.getDate()
            );
            return checkInDate.getTime() === tomorrow.getTime();
          });
          break;
        case "this_week":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          filtered = filtered.filter((booking) => {
            const checkIn = new Date(
              booking.bookingDetails?.checkIn || booking.checkIn
            );
            return checkIn >= weekStart && checkIn <= weekEnd;
          });
          break;
        case "this_month":
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
          );
          filtered = filtered.filter((booking) => {
            const checkIn = new Date(
              booking.bookingDetails?.checkIn || booking.checkIn
            );
            return checkIn >= monthStart && checkIn <= monthEnd;
          });
          break;
        case "custom":
          if (customDateFrom && customDateTo) {
            const fromDate = new Date(customDateFrom);
            const toDate = new Date(customDateTo);
            filtered = filtered.filter((booking) => {
              const checkIn = new Date(
                booking.bookingDetails?.checkIn || booking.checkIn
              );
              return checkIn >= fromDate && checkIn <= toDate;
            });
          }
          break;
      }
    }

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, dateFilter, customDateFrom, customDateTo]);

  const resetFilters = () => {
    setStatusFilter("all");
    setDateFilter("all");
    setCustomDateFrom("");
    setCustomDateTo("");
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">
        All Bookings
      </h1>

      <div className="mb-6">
        <button
          onClick={() => navigate("/receptionist/roomBooking")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200"
        >
          + Create New Booking
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Filter Bookings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
              <option value="no-show">No Show</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date From */}
          {dateFilter === "custom" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Filter Actions */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
          <button
            onClick={resetFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition duration-200"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 border-b">Type</th>
              <th className="py-3 px-4 border-b">Guest Details</th>
              <th className="py-3 px-4 border-b">Room No</th>
              <th className="py-3 px-4 border-b">Check-In</th>
              <th className="py-3 px-4 border-b">Check-Out</th>
              <th className="py-3 px-4 border-b">Status</th>
              <th className="py-3 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      booking.bookingType === "online"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {booking.bookingType === "online" ? "Online" : "Reception"}
                  </span>
                </td>
                <td className="py-3 px-4 border-b">
                  <div>
                    <div className="font-medium text-gray-900">
                      {booking.guestDetails?.name || booking.fullName || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.guestDetails?.mobile ||
                        booking.phoneNumber ||
                        booking.contactNumber ||
                        booking.mobile ||
                        "No mobile number"}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 border-b">
                  {booking.bookingDetails?.roomNumber ||
                    booking.roomNumber ||
                    "N/A"}
                </td>
                <td className="py-3 px-4 border-b">
                  {formatDate(
                    booking.bookingDetails?.checkIn || booking.checkIn
                  )}
                </td>
                <td className="py-3 px-4 border-b">
                  {formatDate(
                    booking.bookingDetails?.checkOut || booking.checkOut
                  )}
                </td>
                <td className="py-3 px-4 border-b">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "cancelled" ||
                          booking.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="py-3 px-4 border-b">
                  <Link
                    to={`/receptionist/bookings/${booking._id}`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition duration-200"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBookings.length === 0 && bookings.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            No bookings match the selected filters
          </div>
        )}
        {bookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No bookings found
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
