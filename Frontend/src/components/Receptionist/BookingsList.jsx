import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]); // Store all bookings for pagination
  const [filteredBookings, setFilteredBookings] = useState([]); // Store filtered bookings for pagination info
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [searchBookingId, setSearchBookingId] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentBookingDetails, setCurrentBookingDetails] = useState(null);
  const [statusEdit, setStatusEdit] = useState('');
  const [statusEditId, setStatusEditId] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFiltersAndPagination();
  }, [filterDate, filterStatus, filterType, searchBookingId, currentPage, allBookings]);

  // Helper function to determine booking type
  const getBookingType = (booking) => {
    // If booking has a specific field indicating type, use it
    if (booking.bookingType) {
      return booking.bookingType;
    }
    
    // If booking has paymentProof, it's likely an online booking
    if (booking.paymentProof) {
      return 'Online';
    }
    
    // If booking was created without payment proof, it's likely a reception booking
    return 'Reception';
  };

  // Helper function to get guest count (peopleCount == guestCount)
  const getGuestCount = (booking) => {
    return booking.guestCount || booking.peopleCount || 1;
  };

  // Helper function to get total amount with calculation for online bookings
  const getTotalAmount = (booking) => {
    console.log('getTotalAmount called for booking:', {
      id: booking._id,
      type: getBookingType(booking),
      totalAmount: booking.totalAmount,
      peopleCount: booking.peopleCount,
      guestCount: booking.guestCount,
      calculatedGuestCount: getGuestCount(booking)
    });

    // For online bookings, always check if we need to calculate
    if (getBookingType(booking) === 'Online') {
      // If totalAmount exists and is greater than 0, use it (backend calculated)
      if (booking.totalAmount && booking.totalAmount > 0) {
        console.log('Using backend totalAmount:', booking.totalAmount);
        return booking.totalAmount;
      }
      // Otherwise, calculate it (fallback calculation)
      const guestCount = getGuestCount(booking);
      const baseRate = 500; // Rs.500 per person for 2 hours
      const calculated = guestCount * baseRate;
      console.log('Calculating totalAmount:', { guestCount, baseRate, calculated });
      return calculated;
    }
    
    // For reception bookings, use totalAmount if available, otherwise 0
    const amount = booking.totalAmount || 0;
    console.log('Reception booking amount:', amount);
    return amount;
  };

  // Helper function to get advance amount
  const getAdvanceAmount = (booking) => {
    return booking.advanceAmount || booking.advance || 0;
  };

  // Helper function to format date in M/D/YYYY format
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    let date;
    if (typeof dateValue === 'string') {
      // Handle both ISO strings and simple date strings
      date = new Date(dateValue);
    } else {
      date = dateValue;
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    // Format as M/D/YYYY (e.g., "7/12/2025")
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to format time in HH:MM format
  const formatTime = (timeValue, dateValue) => {
    if (timeValue) {
      return timeValue;
    }
    
    if (dateValue) {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      }
    }
    
    return 'N/A';
  };

  // Helper function to build proper image URLs
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it's a base64 data URL, return as is
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // If it starts with uploads/, remove it since we'll add it
    const cleanPath = imagePath.startsWith('uploads/') ? imagePath.substring(8) : imagePath;
    
    // Build the full URL
    return `http://localhost:5000/uploads/${cleanPath}`;
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      let url = 'http://localhost:5000/api/poolBookings';
      
      // Fetch all bookings without filters
      const res = await axios.get(url);
      let bookingsData = Array.isArray(res.data.bookings) ? res.data.bookings : [];
      
      setAllBookings(bookingsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndPagination = () => {
    let filteredData = [...allBookings];

    // Apply BookingID search filter
    if (searchBookingId.trim()) {
      filteredData = filteredData.filter(booking => 
        booking.bookingId && booking.bookingId.toLowerCase().includes(searchBookingId.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus) {
      filteredData = filteredData.filter(booking => {
        const bookingStatus = booking.status || 'pending';
        return bookingStatus === filterStatus;
      });
    }
    
    // Apply type filter
    if (filterType) {
      filteredData = filteredData.filter(booking => {
        const bookingType = getBookingType(booking);
        return bookingType.toLowerCase() === filterType.toLowerCase();
      });
    }
    
    // Apply date filter
    if (filterDate) {
      const selectedDate = new Date(filterDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      filteredData = filteredData.filter(booking => {
        // Check both date and checkIn fields
        let bookingDate = null;
        if (booking.checkIn) {
          bookingDate = new Date(booking.checkIn);
        } else if (booking.date) {
          bookingDate = new Date(booking.date);
        }
        
        if (bookingDate) {
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate.getTime() === selectedDate.getTime();
        }
        return false;
      });
    }

    // Calculate pagination
    const totalItems = filteredData.length;
    const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
    setTotalPages(calculatedTotalPages);
    setFilteredBookings(filteredData); // Store filtered data for pagination info

    // Reset to page 1 if current page is out of bounds
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(1);
      return; // This will trigger useEffect again with currentPage = 1
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    setBookings(paginatedData);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchBookingId(value);
    setCurrentPage(1); // Reset to first page when searching
    
    // If search is cleared, show all bookings immediately
    if (value === '') {
      // This will trigger the useEffect to recalculate filtered bookings
    }
  };

  const clearAllFilters = () => {
    setFilterDate(null);
    setFilterStatus('');
    setFilterType('');
    setSearchBookingId('');
    setCurrentPage(1);
  };

  const viewDetails = (booking) => {
    setCurrentBookingDetails(booking);
    setShowDetailsModal(true);
    setStatusEdit(booking.status || 'pending');
    setStatusEditId(booking._id);
  };

  const handleStatusChange = (e) => {
    setStatusEdit(e.target.value);
  };

  const saveStatusChange = async () => {
    try {
      await axios.put(`http://localhost:5000/api/poolBookings/${statusEditId}`, {
        status: statusEdit
      });
      fetchBookings();
      setShowDetailsModal(false);
      setStatusEdit('');
      setStatusEditId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const renderPaymentProof = (proof) => {
    if (!proof) return <span className="text-gray-500">No proof uploaded</span>;
    
    if (typeof proof === 'string') {
      if (proof.startsWith('data:')) {
        // Base64 encoded image
        return (
          <img 
            src={proof} 
            alt="Payment proof" 
            className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300"
            onError={(e) => {
              console.error('Base64 image failed to load');
              e.target.src = '';
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        );
      } else if (proof.endsWith('.pdf')) {
        // PDF file
        const fullUrl = buildImageUrl(proof);
        return (
          <a 
            href={fullUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            📄 View PDF
          </a>
        );
      } else {
        // Regular image file
        const fullUrl = buildImageUrl(proof);
        console.log('Loading image:', { original: proof, fullUrl }); // Debug logging
        return (
          <div className="relative">
            <img 
              src={fullUrl} 
              alt="Payment proof" 
              className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300 shadow-sm"
              onError={(e) => {
                console.error('Image failed to load:', { original: proof, fullUrl, error: e });
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', fullUrl);
              }}
            />
            <div 
              className="hidden bg-red-50 border border-red-200 rounded-lg p-4 text-center"
            >
              <span className="text-red-600">❌ Image failed to load</span>
              <br />
              <span className="text-sm text-gray-600">File: {proof}</span>
              <br />
              <a 
                href={fullUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Try opening directly
              </a>
            </div>
          </div>
        );
      }
    } else if (proof instanceof File) {
      const url = URL.createObjectURL(proof);
      if (proof.type === 'application/pdf') {
        return (
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            📄 View PDF
          </a>
        );
      } else {
        return (
          <img 
            src={url} 
            alt="Payment proof" 
            className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300 shadow-sm"
          />
        );
      }
    }
    
    return <span className="text-gray-500">Unsupported file type</span>;
  };

  const formatStatus = (status) => {
    switch(status) {
      case 'notAccepted':
        return 'Not Accepted';
      case 'done':
        return 'Done';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-2 sm:py-4 md:py-6 lg:py-8 px-2 sm:px-4 lg:px-6 xl:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800">Pool Bookings</h1>
          <div className="w-full sm:w-auto">
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              New Booking
            </button>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {/* Search by Booking ID */}
            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 text-sm font-medium">Search by Booking ID:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={searchBookingId}
                  onChange={handleSearchChange}
                  placeholder="Enter Booking ID (e.g., #P001)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={() => {setSearchBookingId(''); setCurrentPage(1);}}
                  className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap px-2"
                >
                  Clear
                </button>
              </div>
            </div>
            
            {/* Filter by Date */}
            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 text-sm font-medium">Filter by Date:</label>
              <div className="flex items-center space-x-2">
                <DatePicker
                  selected={filterDate}
                  onChange={date => {setFilterDate(date); setCurrentPage(1);}}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select a date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  isClearable
                />
                <button
                  onClick={() => {setFilterDate(null); setCurrentPage(1);}}
                  className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap px-2"
                >
                  Clear
                </button>
              </div>
            </div>
            
            {/* Filter by Status */}
            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 text-sm font-medium">Filter by Status:</label>
              <div className="flex items-center space-x-2">
                <select
                  value={filterStatus}
                  onChange={(e) => {setFilterStatus(e.target.value); setCurrentPage(1);}}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="notAccepted">Not Accepted</option>
                  <option value="done">Done</option>
                </select>
                <button
                  onClick={() => {setFilterStatus(''); setCurrentPage(1);}}
                  className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap px-2"
                >
                  Clear
                </button>
              </div>
            </div>
            
            {/* Filter by Type */}
            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 text-sm font-medium">Filter by Type:</label>
              <div className="flex items-center space-x-2">
                <select
                  value={filterType}
                  onChange={(e) => {setFilterType(e.target.value); setCurrentPage(1);}}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="Reception">Reception</option>
                  <option value="Online">Online</option>
                </select>
                <button
                  onClick={() => {setFilterType(''); setCurrentPage(1);}}
                  className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap px-2"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          
          {/* Clear All Filters Button */}
          {(searchBookingId || filterDate || filterStatus || filterType) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={clearAllFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span className="text-sm sm:text-base">{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">Loading...</p>
          </div>
        ) : (
          <>
            {/* Bookings Info */}
            <div className="mb-4 text-sm text-gray-600 bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  Showing {bookings.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
                  {filteredBookings.length !== allBookings.length && ` (filtered from ${allBookings.length} total)`}
                </div>
                {(searchBookingId || filterDate || filterStatus || filterType) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-gray-500 bg-white rounded-lg shadow-md">
                <div className="text-4xl sm:text-6xl mb-4">📝</div>
                <p className="text-base sm:text-lg">No bookings found matching your filters</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or clear them to see all bookings</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-3 text-blue-600 hover:text-blue-800 underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                {/* Mobile and Tablet Card Layout */}
            <div className="block xl:hidden space-y-3 sm:space-y-4 mb-6">
              {bookings.map((booking, index) => (
                <div key={`mobile-${booking._id}-${index}`} className="bg-white rounded-lg shadow-md p-3 sm:p-4 border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-blue-600 mb-1 truncate">{booking.bookingId || 'N/A'}</div>
                      <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{booking.fullName || booking.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate">{booking.phoneNumber || booking.phone}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${
                      booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                      booking.status === 'notAccepted' ? 'bg-red-100 text-red-800' :
                      booking.status === 'done' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {formatStatus(booking.status || 'pending')}
                    </span>
                  </div>
                  
                  {/* Tablet responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm mb-3">
                    <div className="flex justify-between sm:flex-col sm:justify-start items-center sm:items-start">
                      <span className="text-gray-600 font-medium">Date:</span>
                      <span className="text-right sm:text-left">{formatDate(booking.date || booking.checkIn)}</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:justify-start items-center sm:items-start">
                      <span className="text-gray-600 font-medium">Time:</span>
                      <span className="text-right sm:text-left">{formatTime(booking.checkInTime, booking.checkIn)}</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:justify-start items-center sm:items-start">
                      <span className="text-gray-600 font-medium">Type:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getBookingType(booking) === 'Online' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {getBookingType(booking)}
                      </span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:justify-start items-center sm:items-start">
                      <span className="text-gray-600 font-medium">People:</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getGuestCount(booking)} {getGuestCount(booking) === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Payment Details</span>
                      <span className="text-sm sm:text-base font-bold text-green-600">Rs.{getTotalAmount(booking)}</span>
                    </div>
                    
                    {getBookingType(booking) === 'Online' && (!booking.totalAmount || booking.totalAmount === 0) ? (
                      <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
                        <div className="text-xs text-blue-700 font-medium mb-1">
                          💳 Online Booking - Calculated Amount
                        </div>
                        <div className="text-xs text-blue-600">
                          {getGuestCount(booking)} person(s) × Rs.500 (2hrs base) = Rs.{getTotalAmount(booking)}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Payment to be collected at check-in
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Advance:</span>
                            <span className="font-medium text-blue-600">Rs.{getAdvanceAmount(booking)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Remaining:</span>
                            <span className="font-medium text-orange-600">Rs.{getTotalAmount(booking) - getAdvanceAmount(booking)}</span>
                          </div>
                        </div>
                        {getTotalAmount(booking) > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full" 
                              style={{ width: `${Math.max(((getAdvanceAmount(booking)) / getTotalAmount(booking)) * 100, 5)}%` }}
                            ></div>
                          </div>
                        )}
                      </>
                    )}
                    
                    <button
                      onClick={() => viewDetails(booking)}
                      className="w-full mt-3 bg-blue-500 text-white px-3 py-2 rounded-md text-xs sm:text-sm hover:bg-blue-600 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls for Mobile/Tablet */}
            {totalPages > 1 && (
              <div className="xl:hidden mt-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 bg-white rounded-lg shadow-md p-4">
                {/* Items per page selector */}
                <div className="flex items-center space-x-2 text-sm">
                  <label className="text-gray-700">Items per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {/* Pagination buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm rounded-md ${
                            currentPage === pageNum
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    Last
                  </button>
                </div>

                {/* Page info */}
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}

            {/* Desktop and Large Tablet Table Layout */}
            <div className="hidden xl:block bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">People</th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking, index) => (
                      <tr key={`desktop-${booking._id}-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-blue-600">{booking.bookingId || 'N/A'}</div>
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 max-w-32 xl:max-w-none truncate">{booking.fullName || booking.name}</div>
                          <div className="text-sm text-gray-500 max-w-32 xl:max-w-none truncate">{booking.phoneNumber || booking.phone}</div>
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(booking.date || booking.checkIn)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(booking.checkInTime, booking.checkIn)}
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                            booking.status === 'notAccepted' ? 'bg-red-100 text-red-800' :
                            booking.status === 'done' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {formatStatus(booking.status || 'pending')}
                          </span>
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                            getBookingType(booking) === 'Online' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {getBookingType(booking)}
                          </span>
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getGuestCount(booking)} {getGuestCount(booking) === 1 ? 'person' : 'people'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          {getBookingType(booking) === 'Online' && booking.totalAmount === undefined ? (
                            <div className="bg-blue-50 rounded-lg p-2 xl:p-3 border border-blue-200 max-w-xs">
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                Total: <span className="text-green-600">Rs.{getTotalAmount(booking)}</span>
                              </div>
                              <div className="text-xs text-blue-600">
                                {getGuestCount(booking)} person(s) × Rs.500 (2hrs)
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1 max-w-xs">
                              <div className="text-sm font-medium text-gray-900">
                                Total: <span className="text-green-600">Rs.{getTotalAmount(booking)}</span>
                              </div>
                              <div className="text-xs text-gray-600">
                                Advance: <span className="font-medium text-blue-600">Rs.{getAdvanceAmount(booking)}</span>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewDetails(booking)}
                              className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-600 transition-colors"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 bg-white rounded-lg shadow-md p-4">
                {/* Items per page selector */}
                <div className="flex items-center space-x-2 text-sm">
                  <label className="text-gray-700">Items per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {/* Pagination buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm rounded-md ${
                            currentPage === pageNum
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    Last
                  </button>
                </div>

                {/* Page info */}
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
              </>
            )}
          </>
        )}
      </div>

      {/* Enhanced Details Modal */}
      {showDetailsModal && currentBookingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white p-4 sm:p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold truncate">Booking Details</h3>
                  <p className="text-blue-100 mt-1 text-sm sm:text-base">
                    {currentBookingDetails.bookingId && (
                      <span className="font-semibold">{currentBookingDetails.bookingId} - </span>
                    )}
                    Complete booking information
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors flex-shrink-0 ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 md:p-6">
              {/* Payment Summary Section */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <h4 className="text-base sm:text-lg font-semibold text-green-800 mb-3 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span>Payment Summary</span>
                  {getBookingType(currentBookingDetails) === 'Online' && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full self-start sm:self-auto">
                      Online Booking
                    </span>
                  )}
                </h4>
                
                {getBookingType(currentBookingDetails) === 'Online' && currentBookingDetails.totalAmount === undefined ? (
                  <div className="bg-blue-50 rounded-xl p-3 sm:p-4 md:p-6 border border-blue-200 mb-4">
                    <div className="text-blue-800 font-medium mb-3 text-center text-sm sm:text-base">
                      💳 Online Booking - Calculated Amount
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-white p-3 rounded-lg text-center">
                        <p className="text-xs sm:text-sm text-gray-600">Guests</p>
                        <p className="text-lg sm:text-xl font-bold text-blue-600">{getGuestCount(currentBookingDetails)} person(s)</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <p className="text-xs sm:text-sm text-gray-600">Rate</p>
                        <p className="text-sm sm:text-lg font-bold text-blue-600">Rs.500 (2hrs base)</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <p className="text-xs sm:text-sm text-gray-600">Total Amount</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600">Rs.{getTotalAmount(currentBookingDetails)}</p>
                      </div>
                    </div>
                    <div className="text-center mt-4">
                      <p className="text-blue-700 text-xs sm:text-sm">
                        <strong>Note:</strong> Payment will be collected at check-in time
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="bg-white p-3 rounded-lg text-center">
                        <p className="text-xs sm:text-sm text-gray-600">Total Amount</p>
                        <p className="text-base sm:text-xl font-bold text-gray-900">Rs.{getTotalAmount(currentBookingDetails)}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <p className="text-xs sm:text-sm text-gray-600">Advance Paid</p>
                        <p className="text-base sm:text-xl font-bold text-blue-600">Rs.{getAdvanceAmount(currentBookingDetails)}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <p className="text-xs sm:text-sm text-gray-600">Remaining</p>
                        <p className="text-base sm:text-xl font-bold text-orange-600">
                          Rs.{getTotalAmount(currentBookingDetails) - getAdvanceAmount(currentBookingDetails)}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <p className="text-xs sm:text-sm text-gray-600">Payment Status</p>
                        <p className="text-sm sm:text-lg font-semibold text-green-600">
                          {getTotalAmount(currentBookingDetails) > 0 ? 
                            Math.round(((getAdvanceAmount(currentBookingDetails)) / getTotalAmount(currentBookingDetails)) * 100) : 0
                          }% Paid
                        </p>
                      </div>
                    </div>
                    {/* Payment Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                        <div 
                          className="bg-green-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${getTotalAmount(currentBookingDetails) > 0 ? 
                              Math.max(((getAdvanceAmount(currentBookingDetails)) / getTotalAmount(currentBookingDetails)) * 100, 5) : 0
                            }%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Guest Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <h4 className="text-base sm:text-lg font-semibold text-blue-800 mb-3">Guest Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Booking ID</label>
                      <div className="bg-white p-2 rounded border">
                        <span className="font-bold text-blue-600 text-sm sm:text-base">{currentBookingDetails.bookingId || 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Full Name</label>
                      <div className="bg-white p-2 rounded border text-gray-900 text-sm sm:text-base break-words">
                        {currentBookingDetails.fullName || currentBookingDetails.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="bg-white p-2 rounded border text-gray-900 text-sm sm:text-base">
                        {currentBookingDetails.phoneNumber || currentBookingDetails.phone}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">WhatsApp Number</label>
                      <div className="bg-white p-2 rounded border text-gray-900 text-sm sm:text-base">
                        {currentBookingDetails.whatsappNumber || currentBookingDetails.whatsapp || 'Not provided'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Number of People</label>
                      <div className="bg-white p-2 rounded border">
                        <span className="text-gray-900 text-sm sm:text-base">{getGuestCount(currentBookingDetails)}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Booking Type</label>
                      <div className="bg-white p-2 rounded border">
                        <span className={`px-3 py-1 text-xs sm:text-sm rounded-full font-medium ${
                          getBookingType(currentBookingDetails) === 'Online' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {getBookingType(currentBookingDetails)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
                  <h4 className="text-base sm:text-lg font-semibold text-purple-800 mb-3">Booking Schedule</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Check-in Date & Time</label>
                      <div className="bg-white p-2 rounded border text-gray-900 text-sm sm:text-base">
                        {formatDate(currentBookingDetails.checkIn)}
                        <br />
                        {formatTime(currentBookingDetails.checkInTime, currentBookingDetails.checkIn)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Check-out Date & Time</label>
                      <div className="bg-white p-2 rounded border text-gray-900 text-sm sm:text-base">
                        {formatDate(currentBookingDetails.checkOut)}
                        <br />
                        {formatTime(currentBookingDetails.checkOutTime, currentBookingDetails.checkOut)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Booking Status</label>
                      <div className="bg-white p-2 rounded border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className={`px-3 py-1 text-xs sm:text-sm rounded-full font-medium self-start ${
                          currentBookingDetails.status === 'approved' ? 'bg-green-100 text-green-800' :
                          currentBookingDetails.status === 'notAccepted' ? 'bg-red-100 text-red-800' :
                          currentBookingDetails.status === 'done' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {formatStatus(currentBookingDetails.status || 'pending')}
                        </span>
                        <select
                          value={statusEdit}
                          onChange={handleStatusChange}
                          className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm w-full sm:w-auto"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="notAccepted">Not Accepted</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <div className="text-gray-900 text-sm sm:text-base">
                    {new Date(currentBookingDetails.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <div className="text-gray-900 text-sm sm:text-base">
                    {new Date(currentBookingDetails.updatedAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              {/* Special Requests and Notes */}
              {(currentBookingDetails.specificRequest || currentBookingDetails.notes) && (
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Additional Information</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {currentBookingDetails.specificRequest && (
                      <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg">
                        <label className="block text-xs sm:text-sm font-medium text-blue-800 mb-2">Specific Request</label>
                        <div className="text-gray-900 whitespace-pre-line bg-white p-3 rounded border text-sm sm:text-base">
                          {currentBookingDetails.specificRequest}
                        </div>
                      </div>
                    )}
                    {currentBookingDetails.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 sm:p-4 rounded-lg">
                        <label className="block text-xs sm:text-sm font-medium text-yellow-800 mb-2">Internal Notes</label>
                        <div className="text-gray-900 whitespace-pre-line bg-white p-3 rounded border text-sm sm:text-base">
                          {currentBookingDetails.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Proof */}
              {currentBookingDetails.paymentProof && (
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Payment Proof</h4>
                  <div className="bg-green-50 border border-green-200 p-3 sm:p-4 rounded-lg">
                    {renderPaymentProof(currentBookingDetails.paymentProof)}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Close
                </button>
                <button
                  onClick={saveStatusChange}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Save Status Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsList;