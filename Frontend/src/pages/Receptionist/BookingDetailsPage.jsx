import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';

const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalMessage, setStatusModalMessage] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/bookings/${id}`);
        setBooking(response.data);
        setStatus(response.data.status);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/bookings/${id}`, { status });
      setBooking({ ...booking, status, updatedAt: new Date() });
      setIsEditing(false);
      
      // Set appropriate success message based on status change
      let message = '';
      if (status === 'cancelled') {
        message = 'Booking cancelled successfully. The room is now available for new bookings.';
      } else if (status === 'checked-out') {
        message = 'Checked out successfully. The room is now available for new bookings.';
      } else {
        message = `Booking status updated to ${status} successfully.`;
      }
      
      setStatusModalMessage(message);
      setShowStatusModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${id}`);
      navigate('/bookings', { state: { message: 'Booking deleted successfully' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleEditNavigation = () => {
    setShowEditModal(false);
    navigate(`/bookings/${id}/edit`);
  };

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

  if (!booking) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Not Found:</strong>
        <span className="block sm:inline"> Booking not found</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this booking? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Confirmation Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Booking</h3>
            <p className="text-gray-600 mb-6">You are about to edit this booking. Do you want to proceed?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleEditNavigation}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Edit Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Success Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-green-600 mb-4">Success!</h3>
            <p className="text-gray-600 mb-6">{statusModalMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Booking Details</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/bookings')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Back to Bookings
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Edit Booking
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Delete Booking
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Guest Information */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Guest Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-lg">{booking.guestDetails.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Mobile Number</p>
              <p className="text-lg">{booking.guestDetails.mobile}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg">{booking.guestDetails.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">WhatsApp</p>
              <p className="text-lg">{booking.guestDetails.whatsapp || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Booking Information */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Check-In</p>
              <p className="text-lg">{formatDate(booking.bookingDetails.checkIn)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Check-Out</p>
              <p className="text-lg">{formatDate(booking.bookingDetails.checkOut)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Room Number</p>
              <p className="text-lg">{booking.bookingDetails.roomNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Room Type</p>
              <p className="text-lg">{booking.bookingDetails.roomType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">AC Type</p>
              <p className="text-lg">{booking.bookingDetails.acType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Package Type</p>
              <p className="text-lg">{booking.bookingDetails.packageType.toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Payment Type</p>
              <p className="text-lg capitalize">{booking.paymentDetails.paymentType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className="text-lg font-semibold">Rs.{booking.paymentDetails.totalAmount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Advance Paid</p>
              <p className="text-lg">Rs.{booking.paymentDetails.advanceAmount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Remaining Amount</p>
              <p className="text-lg">Rs.{booking.paymentDetails.remainingAmount}</p>
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Status</h2>
          {isEditing ? (
            <div className="flex items-center space-x-4">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="checked-in">Checked In</option>
                <option value="checked-out">Checked Out</option>
                <option value="no-show">No Show</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                booking.status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
                booking.status === 'checked-out' ? 'bg-purple-100 text-purple-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {booking.status}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Change Status
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Timeline</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Booking Created</p>
              <p className="text-sm text-gray-500">{formatDate(booking.createdAt)}</p>
            </div>
          </div>
          
          {booking.updatedAt && (
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Status Updated</p>
                <p className="text-sm text-gray-500">{formatDate(booking.updatedAt)} - Changed to {booking.status}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;