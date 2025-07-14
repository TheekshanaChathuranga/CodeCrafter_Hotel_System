import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useSnackbar } from "notistack";

const BookingList = () => {
  const [roomBookings, setRoomBookings] = useState([]);
  const [poolBookings, setPoolBookings] = useState([]);
  const [eventBookings, setEventBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("room"); // "room", "pool", or "events"
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Fetch room, pool, and event bookings in parallel
      const [roomRes, poolRes, eventRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/bookings/pending`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(`${API_BASE_URL}/admin/bookings/pool/pending`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(`${API_BASE_URL}/admin/bookings/events/pending`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      ]);

      const roomData = await roomRes.json();
      const poolData = await poolRes.json();
      const eventData = eventRes.ok ? await eventRes.json() : [];
      
      setRoomBookings(Array.isArray(roomData) ? roomData : []);
      setPoolBookings(Array.isArray(poolData) ? poolData : []);
      setEventBookings(Array.isArray(eventData) ? eventData : []);
    } catch (err) {
      enqueueSnackbar("Failed to fetch bookings", { variant: "error" });
      setRoomBookings([]);
      setPoolBookings([]);
      setEventBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventBookings = async () => {
    // This function is now included in fetchBookings() above
    // Keeping for backward compatibility but it's not needed
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const currentBookings = activeTab === "room" ? roomBookings : 
                        activeTab === "pool" ? poolBookings : eventBookings;
  
  const filteredBookings = currentBookings.filter((booking) => {
    const searchTerm = search.toLowerCase();
    
    if (activeTab === "room") {
      return (
        booking.roomNumber?.toLowerCase().includes(searchTerm) ||
        booking.fullName?.toLowerCase().includes(searchTerm) ||
        booking.phoneNumber?.toLowerCase().includes(searchTerm)
      );
    } else if (activeTab === "pool") {
      // Pool booking search
      const name = booking.fullName || booking.name || "";
      const phone = booking.phoneNumber || booking.phone || "";
      const email = booking.email || "";
      
      return (
        name.toLowerCase().includes(searchTerm) ||
        phone.toLowerCase().includes(searchTerm) ||
        email.toLowerCase().includes(searchTerm)
      );
    } else {
      // Event booking search
      const name = booking.name || "";
      const phone1 = booking.phone1 || "";
      const phone2 = booking.phone2 || "";
      const email = booking.email || "";
      const eventType = booking.eventType || "";
      
      return (
        name.toLowerCase().includes(searchTerm) ||
        phone1.toLowerCase().includes(searchTerm) ||
        phone2.toLowerCase().includes(searchTerm) ||
        email.toLowerCase().includes(searchTerm) ||
        eventType.toLowerCase().includes(searchTerm)
      );
    }
  });

  // Pagination calculations
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  // Reset to first page when changing tabs, search, or items per page
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-400">...</span>}
            </>
          )}
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-2 text-sm font-medium ${
                currentPage === number
                  ? 'bg-[#16A085] text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {number}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-gray-400">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Pending Bookings</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-600 whitespace-nowrap">
              Show:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#16A085]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16A085]"
            />
          </div>
          <button
            onClick={() => { fetchBookings(); }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#16A085] text-white rounded-md hover:bg-[#138D75] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("room")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "room"
                  ? "border-[#16A085] text-[#16A085]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Room Bookings
              {roomBookings.length > 0 && (
                <span className="ml-2 bg-[#16A085] text-white px-2 py-1 rounded-full text-xs">
                  {roomBookings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("pool")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pool"
                  ? "border-[#16A085] text-[#16A085]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pool Bookings
              {poolBookings.length > 0 && (
                <span className="ml-2 bg-[#16A085] text-white px-2 py-1 rounded-full text-xs">
                  {poolBookings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "events"
                  ? "border-[#16A085] text-[#16A085]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Event Bookings
              {eventBookings.length > 0 && (
                <span className="ml-2 bg-[#16A085] text-white px-2 py-1 rounded-full text-xs">
                  {eventBookings.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {loading && !currentBookings.length ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <RefreshCw className="w-8 h-8 mb-4 animate-spin text-[#16A085]" />
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          {search ? "No matching bookings found" : `No pending ${activeTab === "events" ? "event" : activeTab} bookings`}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activeTab === "room" ? (
            <>
              {/* Room Bookings Table */}
              <div className="grid grid-cols-12 bg-gray-100 p-4 font-semibold text-gray-700">
                <div className="col-span-2">Room</div>
                <div className="col-span-3">Guest Name</div>
                <div className="col-span-2">Phone</div>
                <div className="col-span-3">Check-in / Check-out</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {paginatedBookings.map((booking, index) => (
                <div
                  key={`room-booking-${booking._id}-${index}`}
                  className="grid grid-cols-12 p-4 border-t hover:bg-gray-50 items-center cursor-pointer"
                  onClick={() => navigate(`/admin/bookingNotifications/${booking._id}`)}
                  title="Click to view booking details"
                >
                  <div className="col-span-2 font-medium text-gray-800">
                    <div className="font-bold text-blue-600">
                      {booking.roomNumber}
                    </div>
                    <div className="text-sm text-gray-600">{booking.roomType}</div>
                  </div>
                  <div className="col-span-3 text-gray-800 truncate">
                    <div className="font-medium">{booking.fullName}</div>
                    <div className="text-sm text-gray-600">
                      Adults: {booking.adults}{" "}
                      {booking.children > 0 && `| Children: ${booking.children}`}
                    </div>
                  </div>
                  <div className="col-span-2 text-gray-600 truncate">
                    {booking.phoneNumber}
                  </div>
                  <div className="col-span-3 text-sm">
                    <div className="text-gray-800">
                      <span className="font-medium">In:</span>{" "}
                      {new Date(booking.checkIn).toLocaleDateString()}
                    </div>
                    <div className="text-gray-800">
                      <span className="font-medium">Out:</span>{" "}
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click when clicking button
                        navigate(`/admin/bookingNotifications/${booking._id}`);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title="View details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : activeTab === "pool" ? (
            <>
              {/* Pool Bookings Table */}
              <div className="grid grid-cols-12 bg-gray-100 p-4 font-semibold text-gray-700">
                <div className="col-span-3">Guest Name</div>
                <div className="col-span-2">Phone</div>
                <div className="col-span-2">Email</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1">Guests</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {paginatedBookings.map((booking, index) => {
                const guestName = booking.fullName || booking.name || "N/A";
                const phone = booking.phoneNumber || booking.phone || "N/A";
                const email = booking.email || "N/A";
                const bookingDate = booking.date || booking.checkIn;
                const guestCount = booking.guestCount || booking.peopleCount || 0;
                
                return (
                  <div
                    key={`pool-booking-${booking._id}-${index}`}
                    className="grid grid-cols-12 p-4 border-t hover:bg-gray-50 items-center cursor-pointer"
                    onClick={() => navigate(`/admin/poolBookingNotifications/${booking._id}`)}
                    title="Click to view booking details"
                  >
                    <div className="col-span-3 text-gray-800 truncate">
                      <div className="font-medium">{guestName}</div>
                    </div>
                    <div className="col-span-2 text-gray-600 truncate">
                      {phone}
                    </div>
                    <div className="col-span-2 text-gray-600 truncate">
                      {email}
                    </div>
                    <div className="col-span-2 text-sm text-gray-800">
                      {bookingDate ? new Date(bookingDate).toLocaleDateString() : "N/A"}
                    </div>
                    <div className="col-span-1 text-gray-600">
                      {guestCount}
                    </div>
                    <div className="col-span-1">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click when clicking button
                          navigate(`/admin/poolBookingNotifications/${booking._id}`);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {/* Event Bookings Table */}
              <div className="grid grid-cols-12 bg-gray-100 p-4 font-semibold text-gray-700">
                <div className="col-span-2">Event ID</div>
                <div className="col-span-3">Contact Name</div>
                <div className="col-span-2">Phone</div>
                <div className="col-span-2">Event Type</div>
                <div className="col-span-1">Guests</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {paginatedBookings.map((booking, index) => {
                return (
                  <div
                    key={`event-booking-${booking._id}-${index}`}
                    className="grid grid-cols-12 p-4 border-t hover:bg-gray-50 items-center cursor-pointer"
                    onClick={() => navigate(`/admin/eventBookingNotifications/${booking._id}`)}
                    title="Click to view booking details"
                  >
                    <div className="col-span-2 text-gray-800">
                      <div className="font-medium text-blue-600">
                        {booking.eventId || `#E${booking._id.substring(18, 24).toUpperCase()}`}
                      </div>
                    </div>
                    <div className="col-span-3 text-gray-800 truncate">
                      <div className="font-medium">{booking.name || "N/A"}</div>
                      <div className="text-sm text-gray-600">{booking.email || ""}</div>
                    </div>
                    <div className="col-span-2 text-gray-600 truncate">
                      <div>{booking.phone1 || "N/A"}</div>
                      {booking.phone2 && (
                        <div className="text-sm text-gray-500">{booking.phone2}</div>
                      )}
                    </div>
                    <div className="col-span-2 text-gray-800">
                      <div className="font-medium">{booking.eventType || "N/A"}</div>
                      <div className="text-sm text-gray-600">{booking.hall || ""}</div>
                    </div>
                    <div className="col-span-1 text-gray-600">
                      {booking.noOfGuests || 0}
                    </div>
                    <div className="col-span-1">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click when clicking button
                          navigate(`/admin/eventBookingNotifications/${booking._id}`);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          
          {/* Pagination */}
          {renderPagination()}
        </div>
      )}
    </div>
  );
};

export default BookingList;
