import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/UserAuthContext';
import { receptionAPI } from '../../api/reception';
import SimpleCalendar from '../../components/SimpleCalendar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';
import AllBookingsModal from '../../components/AllBookingsModal';

const ReceptionHome = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [todaysBookings, setTodaysBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateBookings, setSelectedDateBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllBookingsModal, setShowAllBookingsModal] = useState(false);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load data for selected date
  useEffect(() => {
    if (selectedDate) {
      loadSelectedDateBookings();
    }
  }, [selectedDate, allBookings]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test API connection first
      const connectionTest = await receptionAPI.testConnection();
      if (!connectionTest.success) {
        setError(`Backend connection failed: ${connectionTest.error}. Please ensure the backend server is running on port 5000.`);
        setLoading(false);
        return;
      }

      // Load all data in parallel
      const [stats, todayBookings, bookings] = await Promise.all([
        receptionAPI.getDashboardStats(),
        receptionAPI.getTodaysBookings(),
        receptionAPI.getAllBookings()
      ]);

      setDashboardStats(stats);
      setTodaysBookings(todayBookings);
      setAllBookings(bookings);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      
      // More specific error messages
      if (err.message?.includes('Network Error') || err.code === 'ECONNREFUSED') {
        setError('Unable to connect to the backend server. Please ensure the backend is running on http://localhost:5000');
      } else if (err.response?.status === 404) {
        setError('API endpoints not found. Please check if the backend routes are properly configured.');
      } else if (err.message?.includes('Unable to fetch bookings')) {
        setError('Booking data is currently unavailable. Some features may be limited.');
        // Try to load with default data
        setDashboardStats({
          todaysCheckIns: 0,
          todaysCheckOuts: 0,
          currentlyOccupied: 0,
          totalAvailable: 30,
          availableRooms: [
            { type: 'Single Room', available: 5, total: 5, occupied: 0 },
            { type: 'Double Room', available: 15, total: 15, occupied: 0 },
            { type: 'Triple Room', available: 10, total: 10, occupied: 0 }
          ]
        });
        setTodaysBookings([]);
        setAllBookings([]);
      } else {
        setError(`Failed to load dashboard data: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedDateBookings = async () => {
    if (!selectedDate) return;

    try {
      const bookingsForDate = await receptionAPI.getBookingsForDate(selectedDate);
      setSelectedDateBookings(bookingsForDate);
    } catch (err) {
      console.error('Error loading bookings for selected date:', err);
      // Fallback to filtering from allBookings
      if (allBookings.length > 0) {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const bookingsForDate = allBookings.filter(booking => {
          const checkIn = new Date(booking.bookingDetails.checkIn).toISOString().split('T')[0];
          const checkOut = new Date(booking.bookingDetails.checkOut).toISOString().split('T')[0];
          return checkIn <= dateStr && checkOut >= dateStr;
        });
        setSelectedDateBookings(bookingsForDate);
      }
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    try {
      setRefreshing(true);
      await receptionAPI.updateBookingStatus(bookingId, newStatus);
      
      // Refresh data
      await loadDashboardData();
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ErrorDisplay message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Reception Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Welcome back, {user?.username}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {dashboardStats?.isShowingRecentData ? "Recent Check-ins" : "Today's Check-ins"}
                    {dashboardStats?.isShowingRecentData && (
                      <span className="text-xs text-orange-500 block">(Last 7 days)</span>
                    )}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {dashboardStats?.todaysCheckIns || 0}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {dashboardStats?.isShowingRecentData ? "Recent Check-outs" : "Today's Check-outs"}
                    {dashboardStats?.isShowingRecentData && (
                      <span className="text-xs text-orange-500 block">(Last 7 days)</span>
                    )}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {dashboardStats?.todaysCheckOuts || 0}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Available Rooms</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {dashboardStats?.totalAvailable || 0}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Occupied Rooms</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {dashboardStats?.currentlyOccupied || 0}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar and Bookings Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Calendar Section */}
          <div className="order-2 xl:order-1">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Calendar</h3>
            <SimpleCalendar
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              bookings={allBookings}
            />
          </div>

          {/* Selected Date Bookings */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg order-1 xl:order-2">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Bookings for {formatDate(selectedDate)}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedDateBookings.length} booking(s) found
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {selectedDateBookings.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {selectedDateBookings.map((booking) => (
                    <li key={booking._id} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {booking.guestDetails.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Room {booking.bookingDetails.roomNumber} - {booking.bookingDetails.roomType}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatTime(booking.bookingDetails.checkIn)} - {formatTime(booking.bookingDetails.checkOut)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleBookingStatusUpdate(booking._id, 'checked-in')}
                              disabled={refreshing}
                              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            >
                              Check In
                            </button>
                          )}
                          {booking.status === 'checked-in' && (
                            <button
                              onClick={() => handleBookingStatusUpdate(booking._id, 'checked-out')}
                              disabled={refreshing}
                              className="text-xs text-green-600 hover:text-green-800 disabled:opacity-50"
                            >
                              Check Out
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-gray-500">No bookings for this date</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Today's Bookings */}
        <div className="mb-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {todaysBookings.length === 0 ? "Recent Bookings" : "Today's Bookings"}
                </h3>
                {todaysBookings.length === 0 && (
                  <p className="text-sm text-orange-600 mt-1">
                    No bookings for today. Showing recent activity instead.
                  </p>
                )}
              </div>
              <button
                onClick={loadDashboardData}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <svg className={`-ml-0.5 mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <div className="bg-white overflow-x-auto">
              {todaysBookings.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Room
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Guest
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Check-in
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Check-out
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {todaysBookings.map((booking) => (
                          <tr key={booking._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Room {booking.bookingDetails.roomNumber}
                              <div className="text-xs text-gray-500">{booking.bookingDetails.roomType}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {booking.guestDetails.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>{booking.guestDetails.mobile}</div>
                              {booking.guestDetails.email && (
                                <div className="text-xs text-gray-400">{booking.guestDetails.email}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTime(booking.bookingDetails.checkIn)}
                              <div className="text-xs text-gray-400">{formatDate(booking.bookingDetails.checkIn)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTime(booking.bookingDetails.checkOut)}
                              <div className="text-xs text-gray-400">{formatDate(booking.bookingDetails.checkOut)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {booking.status === 'confirmed' && (
                                  <button
                                    onClick={() => handleBookingStatusUpdate(booking._id, 'checked-in')}
                                    disabled={refreshing}
                                    className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                                  >
                                    Check In
                                  </button>
                                )}
                                {booking.status === 'checked-in' && (
                                  <button
                                    onClick={() => handleBookingStatusUpdate(booking._id, 'checked-out')}
                                    disabled={refreshing}
                                    className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                  >
                                    Check Out
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden">
                    <div className="space-y-4 p-4">
                      {todaysBookings.map((booking) => (
                        <div key={booking._id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{booking.guestDetails.name}</h4>
                              <p className="text-sm text-gray-500">Room {booking.bookingDetails.roomNumber} - {booking.bookingDetails.roomType}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Check-in</p>
                              <p className="font-medium">{formatTime(booking.bookingDetails.checkIn)}</p>
                              <p className="text-xs text-gray-400">{formatDate(booking.bookingDetails.checkIn)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Check-out</p>
                              <p className="font-medium">{formatTime(booking.bookingDetails.checkOut)}</p>
                              <p className="text-xs text-gray-400">{formatDate(booking.bookingDetails.checkOut)}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-gray-500 text-sm">Contact</p>
                            <p className="font-medium">{booking.guestDetails.mobile}</p>
                            {booking.guestDetails.email && (
                              <p className="text-sm text-gray-500">{booking.guestDetails.email}</p>
                            )}
                          </div>
                          
                          {(booking.status === 'confirmed' || booking.status === 'checked-in') && (
                            <div className="flex space-x-2">
                              {booking.status === 'confirmed' && (
                                <button
                                  onClick={() => handleBookingStatusUpdate(booking._id, 'checked-in')}
                                  disabled={refreshing}
                                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium disabled:opacity-50"
                                >
                                  Check In
                                </button>
                              )}
                              {booking.status === 'checked-in' && (
                                <button
                                  onClick={() => handleBookingStatusUpdate(booking._id, 'checked-out')}
                                  disabled={refreshing}
                                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium disabled:opacity-50"
                                >
                                  Check Out
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="px-6 py-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Bookings</h3>
                  <p className="text-gray-500 mb-4">
                    There are no bookings to display. This could mean:
                  </p>
                  <ul className="text-gray-500 text-sm space-y-1 max-w-md mx-auto">
                    <li>• No bookings have been made recently</li>
                    <li>• All recent bookings have been processed</li>
                    <li>• Database connection issues</li>
                  </ul>
                  <button
                    onClick={() => window.location.href = '/receptionist/roomBooking'}
                    className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 mr-3"
                  >
                    Create New Booking
                  </button>
                  <button
                    onClick={() => setShowAllBookingsModal(true)}
                    className="mt-6 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                  >
                    View All Bookings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Room Availability */}
        <div className="mb-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Room Availability</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dashboardStats?.availableRooms?.map((room, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900">{room.type}</h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Available:</span>
                        <span className="font-medium text-green-600">{room.available}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Occupied:</span>
                        <span className="font-medium text-red-600">{room.occupied}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Total:</span>
                        <span className="font-medium">{room.total}</span>
                      </div>
                    </div>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${(room.available / room.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 text-center">
                      {Math.round((room.available / room.total) * 100)}% available
                    </div>
                  </div>
                )) || (
                  <div className="col-span-3 text-center text-gray-500 py-4">
                    Loading room availability...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => window.location.href = '/receptionist/roomBooking'}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md text-sm font-medium transition duration-150 ease-in-out flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>New Booking</span>
                </button>
                
                <button 
                  onClick={() => {
                    const confirmedBookings = todaysBookings.filter(b => b.status === 'confirmed');
                    if (confirmedBookings.length > 0) {
                      handleBookingStatusUpdate(confirmedBookings[0]._id, 'checked-in');
                    }
                  }}
                  disabled={!todaysBookings.some(b => b.status === 'confirmed') || refreshing}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-md text-sm font-medium transition duration-150 ease-in-out flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  <span>Quick Check-in</span>
                </button>
                
                <button 
                  onClick={() => {
                    const checkedInBookings = todaysBookings.filter(b => b.status === 'checked-in');
                    if (checkedInBookings.length > 0) {
                      handleBookingStatusUpdate(checkedInBookings[0]._id, 'checked-out');
                    }
                  }}
                  disabled={!todaysBookings.some(b => b.status === 'checked-in') || refreshing}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-md text-sm font-medium transition duration-150 ease-in-out flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Quick Check-out</span>
                </button>
                
                <button 
                  onClick={() => setShowAllBookingsModal(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-md text-sm font-medium transition duration-150 ease-in-out flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>View All Bookings</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {/* Recent activity based on today's bookings */}
                {todaysBookings.slice(0, 4).map((booking, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      booking.status === 'confirmed' ? 'bg-blue-400' :
                      booking.status === 'checked-in' ? 'bg-green-400' :
                      booking.status === 'checked-out' ? 'bg-gray-400' :
                      'bg-yellow-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{booking.guestDetails.name}</span>
                        {booking.status === 'confirmed' && ' - Booking confirmed'}
                        {booking.status === 'checked-in' && ' - Checked in'}
                        {booking.status === 'checked-out' && ' - Checked out'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Room {booking.bookingDetails.roomNumber} • {formatTime(booking.bookingDetails.checkIn)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {todaysBookings.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    <p>No recent activity</p>
                  </div>
                )}
                
                {todaysBookings.length > 4 && (
                  <div className="text-center pt-2">
                    <button 
                      onClick={() => window.location.href = '/receptionist/bookingsList'}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all activity →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* All Bookings Modal */}
      <AllBookingsModal 
        isOpen={showAllBookingsModal} 
        onClose={() => setShowAllBookingsModal(false)} 
      />
    </div>
  );
};

export default ReceptionHome;