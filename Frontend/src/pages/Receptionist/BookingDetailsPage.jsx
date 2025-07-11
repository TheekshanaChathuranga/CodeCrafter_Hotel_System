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
      navigate('/receptionist/bookingsList', { state: { message: 'Booking deleted successfully' } });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">Are you sure you want to delete this booking? This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
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
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Edit Booking</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">You are about to edit this booking. Do you want to proceed?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditNavigation}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
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
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
              <h3 className="text-2xl font-bold text-green-600 mb-4">Success!</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">{statusModalMessage}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">Booking Details</h1>
              {booking.bookingType && (
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                  booking.bookingType === 'online' 
                    ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300' 
                    : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                }`}>
                  {booking.bookingType === 'online' ? 'Online Booking' : 'Reception Booking'}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/receptionist/bookingsList')}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200 hover:shadow-md"
              >
                Back to Bookings
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-md"
              >
                Edit Booking
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-md"
              >
                Delete Booking
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Guest & Booking Info */}
          <div className="xl:col-span-2 space-y-8">
            {/* Guest Information */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                <h2 className="text-2xl font-bold text-white">Guest Information</h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Full Name</p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                      {booking.guestDetails?.name || booking.fullName || 'N/A'}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Mobile Number</p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                      {booking.guestDetails?.mobile || booking.phoneNumber || 'N/A'}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Email</p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-blue-600 transition-colors break-all">
                      {booking.guestDetails?.email || booking.email || 'N/A'}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">WhatsApp</p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                      {booking.guestDetails?.whatsapp || booking.whatsappNumber || 'N/A'}
                    </p>
                  </div>
                  {booking.bookingType === 'online' && (
                    <>
                      <div className="group">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">NIC Number</p>
                        <p className="text-xl text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                          {booking.originalData?.nicNumber || 'N/A'}
                        </p>
                      </div>
                      <div className="group">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Adults</p>
                        <p className="text-xl text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                          {booking.originalData?.adults || 'N/A'}
                        </p>
                      </div>
                      <div className="group">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Children</p>
                        <p className="text-xl text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                          {booking.originalData?.children || 0}
                        </p>
                      </div>
                      {booking.originalData?.specialRequests && (
                        <div className="md:col-span-2 group">
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Special Requests</p>
                          <p className="text-xl text-gray-800 font-medium group-hover:text-blue-600 transition-colors leading-relaxed">
                            {booking.originalData.specialRequests}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
                <h2 className="text-2xl font-bold text-white">Booking Information</h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Check-In</p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-green-600 transition-colors">
                      {formatDate(booking.bookingDetails?.checkIn || booking.checkIn)}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Check-Out</p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-green-600 transition-colors">
                      {formatDate(booking.bookingDetails?.checkOut || booking.checkOut)}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Room Number</p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-green-600 transition-colors">
                      {booking.bookingDetails?.roomNumber || booking.roomNumber || 'N/A'}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Room Type</p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-green-600 transition-colors">
                      {booking.bookingDetails?.roomType || booking.roomType || 'N/A'}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">AC Type</p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-green-600 transition-colors">
                      {booking.bookingDetails?.acType || 'AC'}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Package Type</p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-green-600 transition-colors">
                      {(booking.bookingDetails?.packageType || 'room-only').toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Information - Only for online bookings */}
            {booking.bookingType === 'online' && booking.originalData?.document && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
                  <h2 className="text-2xl font-bold text-white">Document</h2>
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Uploaded Document</p>
                      <a 
                        href={`http://localhost:5000${booking.originalData.document}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Payment & Status */}
          <div className="space-y-8">
            {/* Payment Information */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6">
                <h2 className="text-2xl font-bold text-white">Payment Information</h2>
              </div>
              <div className="p-8">
                {booking.bookingType === 'reception' && booking.paymentDetails ? (
                  <div className="space-y-6">
                    <div className="group">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Type</p>
                      <p className="text-xl text-gray-800 font-medium group-hover:text-orange-600 transition-colors capitalize">
                        {booking.paymentDetails.paymentType}
                      </p>
                    </div>
                    <div className="group">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Amount</p>
                      <p className="text-2xl text-gray-800 font-bold group-hover:text-orange-600 transition-colors">
                        Rs.{booking.paymentDetails.totalAmount}
                      </p>
                    </div>
                    <div className="group">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Advance Paid</p>
                      <p className="text-xl text-gray-800 font-medium group-hover:text-orange-600 transition-colors">
                        Rs.{booking.paymentDetails.advanceAmount}
                      </p>
                    </div>
                    <div className="group">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Remaining Amount</p>
                      <p className="text-xl text-gray-800 font-medium group-hover:text-orange-600 transition-colors">
                        Rs.{booking.paymentDetails.remainingAmount}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <p className="text-gray-600 font-medium mb-2">Payment information not available for online bookings.</p>
                      <p className="text-sm text-gray-500">Payment will be collected at check-in.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Information */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                <h2 className="text-2xl font-bold text-white">Booking Status</h2>
              </div>
              <div className="p-8">
                {isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Update Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                      >
                        {booking.bookingType === 'online' ? (
                          <>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="checked-in">Checked In</option>
                            <option value="checked-out">Checked Out</option>
                          </>
                        ) : (
                          <>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="checked-in">Checked In</option>
                            <option value="checked-out">Checked Out</option>
                            <option value="no-show">No Show</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleStatusUpdate}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Current Status</p>
                      <span className={`inline-flex items-center px-6 py-3 rounded-xl text-lg font-semibold ${
                        booking.status === 'confirmed' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-2 border-green-300' :
                        booking.status === 'cancelled' || booking.status === 'rejected' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-2 border-red-300' :
                        booking.status === 'checked-in' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-2 border-blue-300' :
                        booking.status === 'checked-out' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-2 border-purple-300' :
                        booking.status === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-2 border-yellow-300' :
                        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-2 border-gray-300'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md"
                    >
                      Change Status
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Timeline */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-6">
                <h2 className="text-2xl font-bold text-white">Booking Timeline</h2>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <div className="ml-6">
                      <p className="text-lg font-semibold text-gray-900">Booking Created</p>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(booking.createdAt)}</p>
                    </div>
                  </div>
                  
                  {booking.updatedAt && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                        <span className="text-sm font-bold">2</span>
                      </div>
                      <div className="ml-6">
                        <p className="text-lg font-semibold text-gray-900">Status Updated</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(booking.updatedAt)} - Changed to {booking.status}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;