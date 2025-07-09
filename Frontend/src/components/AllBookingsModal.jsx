import React, { useState, useEffect } from 'react';
import { receptionAPI } from '../api/reception';
import LoadingSpinner from './LoadingSpinner';

const AllBookingsModal = ({ isOpen, onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, confirmed, checked-in, checked-out, cancelled

  useEffect(() => {
    if (isOpen) {
      loadAllBookings();
    }
  }, [isOpen]);

  const loadAllBookings = async () => {
    setLoading(true);
    try {
      const allBookings = await receptionAPI.getAllBookings();
      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading all bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'confirmed': 'bg-blue-100 text-blue-800',
      'checked-in': 'bg-green-100 text-green-800',
      'checked-out': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800',
      'no-show': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">All Bookings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          {['all', 'confirmed', 'checked-in', 'checked-out', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} 
              ({status === 'all' ? bookings.length : bookings.filter(b => b.status === status).length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {filteredBookings.length > 0 ? (
              <div className="grid gap-4">
                {filteredBookings.map((booking) => (
                  <div key={booking._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{booking.guestDetails.name}</h4>
                        <p className="text-sm text-gray-500">
                          Room {booking.bookingDetails.roomNumber} - {booking.bookingDetails.roomType}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Check-in</p>
                        <p className="font-medium">{formatDate(booking.bookingDetails.checkIn)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Check-out</p>
                        <p className="font-medium">{formatDate(booking.bookingDetails.checkOut)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Contact</p>
                        <p className="font-medium">{booking.guestDetails.mobile}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Amount</p>
                        <p className="font-medium">LKR {booking.paymentDetails.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No bookings found for the selected filter.</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllBookingsModal;
