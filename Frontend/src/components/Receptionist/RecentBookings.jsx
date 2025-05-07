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
      const res = await axios.get('http://localhost:5000/api/poolbookings?limit=5');
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch recent bookings');
      console.error('Fetch bookings error:', err);
      setBookings([]); // Reset bookings on error
    } finally {
      setLoading(false);
    }
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
              <p className="font-medium text-gray-800">{booking.name}</p>
              <p className="text-sm text-gray-600">
                Phone: {booking.phone} | People: {booking.peopleCount}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="text-xs text-gray-500">Check-in</p>
                  <p className="text-sm">
                    {new Date(booking.checkIn).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Check-out</p>
                  <p className="text-sm">
                    {new Date(booking.checkOut).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm font-semibold text-blue-600">
                  Amount: Rs.{booking.totalAmount}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(booking.createdAt).toLocaleDateString()}
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