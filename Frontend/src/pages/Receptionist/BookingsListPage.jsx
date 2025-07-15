import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { X } from "lucide-react";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [bookingIdFilter, setBookingIdFilter] = useState("");
  const navigate = useNavigate();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage, setBookingsPerPage] = useState(10);
  const [paginatedBookings, setPaginatedBookings] = useState([]);

  // Sorting states
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

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

  // Sorting effect - Apply sorting to filtered bookings
  useEffect(() => {
    let filtered = [...bookings];

    // Apply all filters first
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

    // Booking ID filter
    if (bookingIdFilter.trim()) {
      filtered = filtered.filter((booking) => {
        const bookingId = booking.bookingId || `#${booking._id.slice(-4).toUpperCase()}`;
        const guestName = booking.guestDetails?.name || booking.fullName || "";
        const mobile = booking.guestDetails?.mobile || booking.phoneNumber || "";
        const roomNumber = booking.bookingDetails?.roomNumber || booking.roomNumber || "";
        
        return (
          bookingId.toLowerCase().includes(bookingIdFilter.toLowerCase()) ||
          guestName.toLowerCase().includes(bookingIdFilter.toLowerCase()) ||
          mobile.includes(bookingIdFilter) ||
          roomNumber.toLowerCase().includes(bookingIdFilter.toLowerCase())
        );
      });
    }

    // Apply sorting if a sort field is selected
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortField) {
          case 'bookingId':
            aValue = a.bookingId || `#${a._id.slice(-4).toUpperCase()}`;
            bValue = b.bookingId || `#${b._id.slice(-4).toUpperCase()}`;
            break;
          case 'roomNumber':
            aValue = a.bookingDetails?.roomNumber || a.roomNumber || '';
            bValue = b.bookingDetails?.roomNumber || b.roomNumber || '';
            // Convert to numbers for proper sorting if they are numeric
            if (!isNaN(aValue) && !isNaN(bValue)) {
              aValue = parseInt(aValue);
              bValue = parseInt(bValue);
            }
            break;
          case 'checkIn':
            aValue = new Date(a.bookingDetails?.checkIn || a.checkIn);
            bValue = new Date(b.bookingDetails?.checkIn || b.checkIn);
            break;
          case 'guestName':
            aValue = (a.guestDetails?.name || a.fullName || '').toLowerCase();
            bValue = (b.guestDetails?.name || b.fullName || '').toLowerCase();
            break;
          case 'status':
            aValue = a.status.toLowerCase();
            bValue = b.status.toLowerCase();
            break;
          default:
            return 0;
        }

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

        // Compare values
        if (aValue < bValue) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, dateFilter, customDateFrom, customDateTo, bookingIdFilter, sortField, sortDirection]);

  // Pagination effect
  useEffect(() => {
    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
    setPaginatedBookings(currentBookings);
  }, [filteredBookings, currentPage, bookingsPerPage]);

  // Reset to first page when filters, sorting, or bookings per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter, customDateFrom, customDateTo, bookingIdFilter, bookingsPerPage, sortField, sortDirection]);

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it as the sort field with ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Function to get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (sortDirection === 'asc') {
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
  };

  // Pagination helper functions
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1, '...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1, '...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...', totalPages);
      }
    }
    return pageNumbers;
  };

  // Keyboard navigation for pagination
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only handle if no input is focused
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') {
        return;
      }

      if (event.key === 'ArrowLeft' && currentPage > 1) {
        goToPreviousPage();
      } else if (event.key === 'ArrowRight' && currentPage < totalPages) {
        goToNextPage();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages]);

  const resetFilters = () => {
    setStatusFilter("all");
    setDateFilter("all");
    setCustomDateFrom("");
    setCustomDateTo("");
    setBookingIdFilter("");
    setCurrentPage(1);
    setSortField(null);
    setSortDirection('asc');
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
      {/* <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">
        All Bookings
      </h1> */}

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
          {/* Search and Sorting Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            {/* Booking ID Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Booking ID, Name, Mobile, Room..."
                value={bookingIdFilter}
                onChange={(e) => setBookingIdFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Clear Search Button */}
            {bookingIdFilter && (
              <div>
                <button
                  onClick={() => setBookingIdFilter("")}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Current Sort Indicator */}
            {sortField && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Sort
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                  <span className="text-sm text-blue-700">
                    <strong>{
                      sortField === 'bookingId' ? 'Booking ID' :
                      sortField === 'guestName' ? 'Guest Name' :
                      sortField === 'roomNumber' ? 'Room No' :
                      sortField === 'checkIn' ? 'Check-In' :
                      sortField === 'status' ? 'Status' : sortField
                    }</strong> ({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})
                  </span>
                  <button
                    onClick={() => {
                      setSortField(null);
                      setSortDirection('asc');
                    }}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="Clear sorting"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

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
            Showing {paginatedBookings.length} of {filteredBookings.length} bookings 
            {filteredBookings.length !== bookings.length && ` (filtered from ${bookings.length} total)`}
            {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
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
              <th className="py-3 px-4 border-b">
                <button
                  onClick={() => handleSort('bookingId')}
                  className="flex items-center space-x-1 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Booking ID</span>
                  {getSortIcon('bookingId')}
                </button>
              </th>
              <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Type</th>
              <th className="py-3 px-4 border-b">
                <button
                  onClick={() => handleSort('guestName')}
                  className="flex items-center space-x-1 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Guest Details</span>
                  {getSortIcon('guestName')}
                </button>
              </th>
              <th className="py-3 px-4 border-b">
                <button
                  onClick={() => handleSort('roomNumber')}
                  className="flex items-center space-x-1 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Room No</span>
                  {getSortIcon('roomNumber')}
                </button>
              </th>
              <th className="py-3 px-4 border-b">
                <button
                  onClick={() => handleSort('checkIn')}
                  className="flex items-center space-x-1 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Check-In</span>
                  {getSortIcon('checkIn')}
                </button>
              </th>
              <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Check-Out</th>
              <th className="py-3 px-4 border-b">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Status</span>
                  {getSortIcon('status')}
                </button>
              </th>
              <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">
                  <span className="font-bold text-blue-600">
                    {booking.bookingId || `#${booking._id.slice(-4).toUpperCase()}`}
                  </span>
                </td>
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

      {/* Pagination Component */}
      {filteredBookings.length > 0 && (
        <div className="bg-white rounded-lg shadow-md mt-6 p-4 lg:p-6">
          {totalPages > 1 ? (
            <>
              {/* Desktop Pagination */}
              <div className="hidden lg:block">
                <div className="flex justify-between items-center">
                  {/* Left: Pagination Info and Items per page */}
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * bookingsPerPage) + 1} to {Math.min(currentPage * bookingsPerPage, filteredBookings.length)} of {filteredBookings.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Show:</span>
                      <select
                        value={bookingsPerPage}
                        onChange={(e) => setBookingsPerPage(parseInt(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="text-sm text-gray-600">per page</span>
                    </div>
                  </div>

                  {/* Center: Pagination Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex items-center space-x-1">
                      {getPageNumbers().map((pageNumber, index) => (
                        <button
                          key={index}
                          onClick={() => typeof pageNumber === 'number' && goToPage(pageNumber)}
                          disabled={pageNumber === '...'}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            pageNumber === currentPage
                              ? 'bg-blue-500 text-white'
                              : pageNumber === '...'
                              ? 'text-gray-400 cursor-default'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      Next
                    </button>
                  </div>

                  {/* Right: Go to Page */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Go to:</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const page = parseInt(e.target.value);
                        if (page >= 1 && page <= totalPages) {
                          goToPage(page);
                        }
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">of {totalPages}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Use ← → arrow keys to navigate pages
                  </span>
                </div>
              </div>

              {/* Mobile Pagination */}
              <div className="lg:hidden space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Show:</span>
                    <select
                      value={bookingsPerPage}
                      onChange={(e) => setBookingsPerPage(parseInt(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-center items-center space-x-3">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className={`px-2 py-1 rounded text-sm ${
                      currentPage === 1 ? 'text-gray-400' : 'text-blue-500 hover:text-blue-700'
                    }`}
                  >
                    First
                  </button>
                  
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    ← Prev
                  </button>
                  
                  <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                    {currentPage}
                  </span>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Next →
                  </button>
                  
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-2 py-1 rounded text-sm ${
                      currentPage === totalPages ? 'text-gray-400' : 'text-blue-500 hover:text-blue-700'
                    }`}
                  >
                    Last
                  </button>
                </div>
                
                <div className="text-center text-sm text-gray-600">
                  Showing {((currentPage - 1) * bookingsPerPage) + 1}-{Math.min(currentPage * bookingsPerPage, filteredBookings.length)} of {filteredBookings.length}
                </div>
              </div>
            </>
          ) : (
            // Single page info
            <div className="text-center">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing all {filteredBookings.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Show:</span>
                  <select
                    value={bookingsPerPage}
                    onChange={(e) => setBookingsPerPage(parseInt(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">per page</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
