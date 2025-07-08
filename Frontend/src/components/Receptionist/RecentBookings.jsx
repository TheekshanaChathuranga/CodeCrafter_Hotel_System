import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RecentBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('http://localhost:5000/api/bookings?limit=5'); // Changed endpoint
      setBookings(Array.isArray(res.data.bookings) ? res.data.bookings : []); // Access bookings array from response
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch recent bookings');
      console.error('Fetch bookings error:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (checkIn, checkOut) => {
    const duration = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Recent Bookings</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
          <button 
            onClick={fetchBookings}
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            Retry
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-gray-500 py-4 text-center">
          {error ? '' : 'No bookings found'}
        </p>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {bookings.map(booking => (
            <div key={booking._id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-gray-800">
                  {booking.fullName || booking.name}
                </p>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {formatDuration(
                    booking.checkInTime || booking.checkIn,
                    booking.checkOutTime || booking.checkOut
                  )}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Phone: {booking.phoneNumber || booking.phone} | WhatsApp: {booking.whatsappNumber || booking.whatsapp} | People: {booking.guestCount || booking.peopleCount}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="text-xs text-gray-500">Check-in</p>
                  <p className="text-sm">
                    {(booking.checkInTime || booking.checkIn) ? new Date(booking.checkInTime || booking.checkIn).toLocaleString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Check-out</p>
                  <p className="text-sm">
                    {(booking.checkOutTime || booking.checkOut) ? new Date(booking.checkOutTime || booking.checkOut).toLocaleString() : '-'}
                  </p>
                </div>
              </div>
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                <div className="flex justify-between">
                  <span>Base Rate (2h):</span>
                  <span>Rs.500</span>
                </div>
                {booking.additionalHours > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Additional Hours ({booking.additionalHours}h):</span>
                    <span>Rs.{booking.additionalHours * 200}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium border-t pt-1 mt-1">
                  <span>Per Person:</span>
                  <span>
                    Rs.
                    {booking.peopleCount || booking.guestCount
                      ? Math.round(
                          booking.totalAmount /
                            (booking.peopleCount || booking.guestCount)
                        )
                      : booking.totalAmount}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm font-semibold text-blue-600">
                  Total: Rs.{booking.totalAmount}
                </p>
                <p className="text-xs text-gray-400">
                  {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentBookings;