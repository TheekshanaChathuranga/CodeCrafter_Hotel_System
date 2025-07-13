import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Search, Eye } from "lucide-react";
import { useSnackbar } from "notistack";

const BookingList = () => {
  const [roomBookings, setRoomBookings] = useState([]);
  const [poolBookings, setPoolBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("room"); // "room" or "pool"
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [eventBookings, setEventBookings] = useState([]);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Fetch both room and pool bookings in parallel
      const [roomRes, poolRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/bookings/pending`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(`${API_BASE_URL}/admin/bookings/pool/pending`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      ]);

      const roomData = await roomRes.json();
      const poolData = await poolRes.json();
      
      setRoomBookings(Array.isArray(roomData) ? roomData : []);
      setPoolBookings(Array.isArray(poolData) ? poolData : []);
    } catch (err) {
      enqueueSnackbar("Failed to fetch bookings", { variant: "error" });
      setRoomBookings([]);
      setPoolBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventBookings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/customer-events/pending`);
      const data = await res.json();
      setEventBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      enqueueSnackbar('Failed to fetch event bookings', { variant: 'error' });
      setEventBookings([]);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchEventBookings();
  }, []);

  const currentBookings = activeTab === "room" ? roomBookings : poolBookings;
  
  const filteredBookings = currentBookings.filter((booking) => {
    const searchTerm = search.toLowerCase();
    
    if (activeTab === "room") {
      return (
        booking.roomNumber?.toLowerCase().includes(searchTerm) ||
        booking.fullName?.toLowerCase().includes(searchTerm) ||
        booking.phoneNumber?.toLowerCase().includes(searchTerm)
      );
    } else {
      // Pool booking search
      const name = booking.fullName || booking.name || "";
      const phone = booking.phoneNumber || booking.phone || "";
      const email = booking.email || "";
      
      return (
        name.toLowerCase().includes(searchTerm) ||
        phone.toLowerCase().includes(searchTerm) ||
        email.toLowerCase().includes(searchTerm)
      );
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Pending Bookings</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
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
            onClick={() => { fetchBookings(); fetchEventBookings(); }}
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
          {search ? "No matching bookings found" : `No pending ${activeTab} bookings`}
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

              {filteredBookings.map((booking, index) => (
                <div
                  key={`room-booking-${booking._id}-${index}`}
                  className="grid grid-cols-12 p-4 border-t hover:bg-gray-50 items-center"
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
                      onClick={() =>
                        navigate(`/admin/bookingNotifications/${booking._id}`)
                      }
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title="View details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
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

              {filteredBookings.map((booking, index) => {
                const guestName = booking.fullName || booking.name || "N/A";
                const phone = booking.phoneNumber || booking.phone || "N/A";
                const email = booking.email || "N/A";
                const bookingDate = booking.date || booking.checkIn;
                const guestCount = booking.guestCount || booking.peopleCount || 0;
                
                return (
                  <div
                    key={`pool-booking-${booking._id}-${index}`}
                    className="grid grid-cols-12 p-4 border-t hover:bg-gray-50 items-center"
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
                        onClick={() =>
                          navigate(`/admin/poolBookingNotifications/${booking._id}`)
                        }
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
        </div>
      )}

      {/* Pending Events Section */}
      <h1 className="text-2xl font-bold text-gray-800 mt-12">Pending Events</h1>
      {eventBookings.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg mt-4">No pending events</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden mt-4">
          <div className="grid grid-cols-12 bg-gray-100 p-4 font-semibold text-gray-700">
            <div className="col-span-3">Contact Name</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Event Type</div>
            <div className="col-span-2">Attendees</div>
          </div>
          {eventBookings.map((ev, idx) => (
            <div key={`event-booking-${ev._id}-${idx}`} className="grid grid-cols-12 p-4 border-t hover:bg-gray-50 items-center">
              <div className="col-span-3 font-medium text-gray-800 truncate">{ev.contactName}</div>
              <div className="col-span-2 text-gray-600 truncate">{ev.phone}</div>
              <div className="col-span-3 text-gray-600 truncate">{ev.email}</div>
              <div className="col-span-2 text-gray-800">{ev.eventType}</div>
              <div className="col-span-2 text-gray-800">{ev.attendees}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingList;
