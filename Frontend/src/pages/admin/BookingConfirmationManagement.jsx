import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Search, Eye } from "lucide-react";
import { useSnackbar } from "notistack";

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Since API_BASE_URL already includes /api, use it directly
      const res = await fetch(`${API_BASE_URL}/admin/bookings/pending`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      enqueueSnackbar("Failed to fetch bookings", { variant: "error" });
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const searchTerm = search.toLowerCase();
    return (
      booking.roomNumber?.toLowerCase().includes(searchTerm) ||
      booking.fullName?.toLowerCase().includes(searchTerm) ||
      booking.phoneNumber?.toLowerCase().includes(searchTerm)
    );
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
            onClick={fetchBookings}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#16A085] text-white rounded-md hover:bg-[#138D75] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading && !bookings.length ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <RefreshCw className="w-8 h-8 mb-4 animate-spin text-[#16A085]" />
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          {search ? "No matching bookings found" : "No pending bookings"}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
              key={`admin-booking-${booking._id}-${index}`}
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
        </div>
      )}
    </div>
  );
};

export default BookingList;
