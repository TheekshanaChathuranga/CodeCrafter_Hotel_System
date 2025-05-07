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
      const res = await axios.get('/api/bookings?limit=5');
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to fetch recent bookings');
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Recent Bookings</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-500">No bookings yet</p>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {bookings.map(booking => (
            <div key={booking._id} className="border-b border-gray-200 pb-4">
              <p className="font-medium">{booking.name}</p>
              <p className="text-sm text-gray-600">
                Phone: {booking.phone} | People: {booking.peopleCount}
              </p>
              <p className="text-sm">
                Check-in: {new Date(booking.checkIn).toLocaleString()}
              </p>
              <p className="text-sm">
                Check-out: {new Date(booking.checkOut).toLocaleString()}
              </p>
              <p className="text-sm font-semibold">
                Amount: Rs.{booking.totalAmount}
              </p>
              <p className="text-xs text-gray-500">
                Booked at: {new Date(booking.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentBookings;