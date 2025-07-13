import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Search } from "lucide-react";
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Pending Bookings</h1>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search bookings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && !bookings.length ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="animate-spin w-8 h-8 text-blue-500" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          {search ? "No matching bookings found" : "No pending bookings"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map((booking, index) => (
            <div
              key={`admin-booking-${booking._id}-${index}`}
              onClick={() =>
                navigate(`/admin/bookingNotifications/${booking._id}`)
              }
              className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-blue-600">
                    {booking.roomNumber} - {booking.roomType}
                  </h3>
                  <p className="font-medium">{booking.fullName}</p>
                  <p className="text-sm text-gray-600">{booking.phoneNumber}</p>
                  <p className="text-sm mt-2">
                    <span className="font-semibold">Dates:</span>{" "}
                    {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                    {new Date(booking.checkOut).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  Pending
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingList;
