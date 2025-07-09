import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentBookingDetails, setCurrentBookingDetails] = useState(null);
  const [statusEdit, setStatusEdit] = useState('');
  const [statusEditId, setStatusEditId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, [filterDate, filterStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      let url = 'http://localhost:5000/api/bookings';
      
      // Fetch all bookings and apply filters client-side for better reliability
      const res = await axios.get(url);
      let bookingsData = Array.isArray(res.data.bookings) ? res.data.bookings : [];
      
      // Apply status filter client-side
      if (filterStatus) {
        bookingsData = bookingsData.filter(booking => {
          const bookingStatus = booking.status || 'pending';
          return bookingStatus === filterStatus;
        });
      }
      
      // Apply date filter client-side for better compatibility
      if (filterDate) {
        const selectedDate = new Date(filterDate);
        selectedDate.setHours(0, 0, 0, 0);
        
        bookingsData = bookingsData.filter(booking => {
          // Check both date and checkIn fields
          let bookingDate = null;
          if (booking.checkIn) {
            bookingDate = new Date(booking.checkIn);
          } else if (booking.date) {
            bookingDate = new Date(booking.date);
          }
          
          if (bookingDate) {
            bookingDate.setHours(0, 0, 0, 0);
            return bookingDate.getTime() === selectedDate.getTime();
          }
          return false;
        });
      }
      
      setBookings(bookingsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (booking) => {
    setCurrentBookingDetails(booking);
    setShowDetailsModal(true);
    setStatusEdit(booking.status || 'pending');
    setStatusEditId(booking._id);
  };

  const handleStatusChange = (e) => {
    setStatusEdit(e.target.value);
  };

  const saveStatusChange = async () => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${statusEditId}`, {
        status: statusEdit
      });
      fetchBookings();
      setShowDetailsModal(false);
      setStatusEdit('');
      setStatusEditId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const renderPaymentProof = (proof) => {
    if (!proof) return <span className="text-gray-500">No proof uploaded</span>;
    
    if (typeof proof === 'string') {
      if (proof.startsWith('data:')) {
        return <img src={proof} alt="Payment proof" className="max-w-full h-auto max-h-64" />;
      } else if (proof.endsWith('.pdf')) {
        return (
          <a 
            href={proof} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View PDF
          </a>
        );
      } else {
        return <img src={proof} alt="Payment proof" className="max-w-full h-auto max-h-64" />;
      }
    } else if (proof instanceof File) {
      const url = URL.createObjectURL(proof);
      if (proof.type === 'application/pdf') {
        return (
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View PDF
          </a>
        );
      } else {
        return <img src={url} alt="Payment proof" className="max-w-full h-auto max-h-64" />;
      }
    }
    
    return <span className="text-gray-500">Unsupported file type</span>;
  };

  const formatStatus = (status) => {
    switch(status) {
      case 'notAccepted':
        return 'Not Accepted';
      case 'done':
        return 'Done';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">🏊‍♂️ Pool Bookings</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              ➕ New Booking
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-gray-700">Filter by Date:</label>
              <DatePicker
                selected={filterDate}
                onChange={date => setFilterDate(date)}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select a date"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                isClearable
              />
              <button
                onClick={() => setFilterDate(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-gray-700">Filter by Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="notAccepted">Not Accepted</option>
                <option value="done">Done</option>
              </select>
              <button
                onClick={() => setFilterStatus('')}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No bookings found</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">People</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map(booking => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.fullName || booking.name}</div>
                      <div className="text-sm text-gray-500">{booking.phoneNumber || booking.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(booking.date || (booking.checkIn && new Date(booking.checkIn).toLocaleDateString()))}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.checkInTime || (booking.checkIn && new Date(booking.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                        booking.status === 'notAccepted' ? 'bg-red-100 text-red-800' :
                        booking.status === 'done' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {formatStatus(booking.status || 'pending')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {booking.guestCount || booking.peopleCount || 1} people
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          Total: <span className="text-green-600">Rs.{booking.totalAmount || 0}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Advance: <span className="font-medium text-blue-600">Rs.{booking.advanceAmount || 0}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Remaining: <span className="font-medium text-orange-600">Rs.{(booking.totalAmount || 0) - (booking.advanceAmount || 0)}</span>
                        </div>
                        {booking.totalAmount > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full" 
                              style={{ width: `${Math.max(((booking.advanceAmount || 0) / booking.totalAmount) * 100, 5)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewDetails(booking)}
                          className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-600 transition-colors"
                        >
                          📋 View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enhanced Details Modal */}
      {showDetailsModal && currentBookingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">📋 Booking Details</h3>
                  <p className="text-blue-100 mt-1">Complete booking information</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Payment Summary Section */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                  💰 Payment Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">Rs.{currentBookingDetails.totalAmount || 0}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Advance Paid</p>
                    <p className="text-xl font-bold text-blue-600">Rs.{currentBookingDetails.advanceAmount || 0}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-xl font-bold text-orange-600">
                      Rs.{(currentBookingDetails.totalAmount || 0) - (currentBookingDetails.advanceAmount || 0)}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="text-lg font-semibold text-green-600">
                      {currentBookingDetails.totalAmount > 0 ? 
                        Math.round(((currentBookingDetails.advanceAmount || 0) / currentBookingDetails.totalAmount) * 100) : 0
                      }% Paid
                    </p>
                  </div>
                </div>
                {/* Payment Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${currentBookingDetails.totalAmount > 0 ? 
                          Math.max(((currentBookingDetails.advanceAmount || 0) / currentBookingDetails.totalAmount) * 100, 5) : 0
                        }%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3">👤 Guest Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <div className="bg-white p-2 rounded border text-gray-900">
                        {currentBookingDetails.fullName || currentBookingDetails.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="bg-white p-2 rounded border text-gray-900">
                        📞 {currentBookingDetails.phoneNumber || currentBookingDetails.phone}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                      <div className="bg-white p-2 rounded border text-gray-900">
                        💬 {currentBookingDetails.whatsappNumber || currentBookingDetails.whatsapp || 'Not provided'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Number of People</label>
                      <div className="bg-white p-2 rounded border">
                        <span className="text-gray-900">👥 {currentBookingDetails.guestCount || currentBookingDetails.peopleCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3">📅 Booking Schedule</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Check-in Date & Time</label>
                      <div className="bg-white p-2 rounded border text-gray-900">
                        📅 {new Date(currentBookingDetails.checkIn).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        <br />
                        🕐 {currentBookingDetails.checkInTime || new Date(currentBookingDetails.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Check-out Date & Time</label>
                      <div className="bg-white p-2 rounded border text-gray-900">
                        📅 {new Date(currentBookingDetails.checkOut).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        <br />
                        🕐 {currentBookingDetails.checkOutTime || new Date(currentBookingDetails.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Booking Status</label>
                      <div className="bg-white p-2 rounded border flex items-center justify-between">
                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                          currentBookingDetails.status === 'approved' ? 'bg-green-100 text-green-800' :
                          currentBookingDetails.status === 'notAccepted' ? 'bg-red-100 text-red-800' :
                          currentBookingDetails.status === 'done' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {currentBookingDetails.status === 'approved' && '✅ '}
                          {currentBookingDetails.status === 'notAccepted' && '❌ '}
                          {currentBookingDetails.status === 'done' && '🎉 '}
                          {currentBookingDetails.status === 'pending' && '⏳ '}
                          {formatStatus(currentBookingDetails.status || 'pending')}
                        </span>
                        <select
                          value={statusEdit}
                          onChange={handleStatusChange}
                          className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="approved">✅ Approved</option>
                          <option value="notAccepted">❌ Not Accepted</option>
                          <option value="done">🎉 Done</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">📅 Created At</label>
                  <div className="text-gray-900">
                    {new Date(currentBookingDetails.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">🔄 Last Updated</label>
                  <div className="text-gray-900">
                    {new Date(currentBookingDetails.updatedAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              {/* Special Requests and Notes */}
              {(currentBookingDetails.specificRequest || currentBookingDetails.notes) && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">📝 Additional Information</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {currentBookingDetails.specificRequest && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-blue-800 mb-2">🎯 Specific Request</label>
                        <div className="text-gray-900 whitespace-pre-line bg-white p-3 rounded border">
                          {currentBookingDetails.specificRequest}
                        </div>
                      </div>
                    )}
                    {currentBookingDetails.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-yellow-800 mb-2">📋 Internal Notes</label>
                        <div className="text-gray-900 whitespace-pre-line bg-white p-3 rounded border">
                          {currentBookingDetails.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Proof */}
              {currentBookingDetails.paymentProof && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">💳 Payment Proof</h4>
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    {renderPaymentProof(currentBookingDetails.paymentProof)}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  ❌ Close
                </button>
                <button
                  onClick={saveStatusChange}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  💾 Save Status Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsList;