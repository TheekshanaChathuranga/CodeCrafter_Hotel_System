import React, { useState, useEffect } from 'react';
import { receptionAPI } from '../api/reception';
import { format } from 'date-fns';

const AllBookingsModal = ({ isOpen, onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to safely access booking properties
  const getBookingData = (booking) => {
    return {
      guestName: booking?.guestDetails?.name || booking?.fullName || 'Unknown Guest',
      roomNumber: booking?.bookingDetails?.roomNumber || booking?.roomNumber || 'N/A',
      roomType: booking?.bookingDetails?.roomType || booking?.roomType || 'Unknown',
      checkIn: booking?.bookingDetails?.checkIn || booking?.checkIn || '',
      checkOut: booking?.bookingDetails?.checkOut || booking?.checkOut || '',
      mobile: booking?.guestDetails?.mobile || booking?.phoneNumber || 'N/A',
      totalAmount: booking?.paymentDetails?.totalAmount || booking?.totalAmount || 0,
      status: booking?.status || 'pending'
    };
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllBookings();
    }
  }, [isOpen]);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await receptionAPI.getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching all bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">All Bookings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-4">
              {error}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No bookings found
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking, index) => {
                const bookingData = getBookingData(booking);
                return (
                  <div key={booking._id || index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{bookingData.guestName}</h4>
                        <p className="text-sm text-gray-600">
                          Room {bookingData.roomNumber} - {bookingData.roomType}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(bookingData.checkIn)} to {formatDate(bookingData.checkOut)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Contact: {bookingData.mobile}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">Rs. {bookingData.totalAmount}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${bookingData.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            bookingData.status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
                            bookingData.status === 'checked-out' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                          {bookingData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllBookingsModal;
