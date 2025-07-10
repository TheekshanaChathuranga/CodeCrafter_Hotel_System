import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/bookings');
        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">All Bookings</h1>
      
      <div className="mb-4">
        <button 
          onClick={() => navigate('/receptionist/roomBooking')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New Booking
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 border-b">Booking ID</th>
              <th className="py-3 px-4 border-b">Type</th>
              <th className="py-3 px-4 border-b">Guest Name</th>
              <th className="py-3 px-4 border-b">Room No</th>
              <th className="py-3 px-4 border-b">Check-In</th>
              <th className="py-3 px-4 border-b">Check-Out</th>
              <th className="py-3 px-4 border-b">Status</th>
              <th className="py-3 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">{booking._id.substring(0, 8)}...</td>
                <td className="py-3 px-4 border-b">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    booking.bookingType === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {booking.bookingType === 'online' ? 'Online' : 'Reception'}
                  </span>
                </td>
                <td className="py-3 px-4 border-b">
                  {booking.guestDetails?.name || booking.fullName || 'N/A'}
                </td>
                <td className="py-3 px-4 border-b">
                  {booking.bookingDetails?.roomNumber || booking.roomNumber || 'N/A'}
                </td>
                <td className="py-3 px-4 border-b">
                  {formatDate(booking.bookingDetails?.checkIn || booking.checkIn)}
                </td>
                <td className="py-3 px-4 border-b">
                  {formatDate(booking.bookingDetails?.checkOut || booking.checkOut)}
                </td>
                <td className="py-3 px-4 border-b">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'cancelled' || booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="py-3 px-4 border-b">
                  <Link
                    to={`/receptionist/bookings/${booking._id}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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