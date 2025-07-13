import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/UserAuthContext';
import { useNavigate } from 'react-router-dom';
import { receptionAPI } from '../../api/reception';
import { 
  Calendar, 
  Clock, 
  Users, 
  Home, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Activity,
  Waves,
  Building
} from 'lucide-react';

const EnhancedReceptionHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateBookings, setSelectedDateBookings] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load data for selected date
  useEffect(() => {
    if (selectedDate) {
      loadSelectedDateBookings();
    }
  }, [selectedDate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statsResponse = await receptionAPI.getDashboardStatsEnhanced();
      setDashboardStats(statsResponse);
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedDateBookings = async () => {
    try {
      setRefreshing(true);
      const bookingsResponse = await receptionAPI.getCombinedBookingsForDate(selectedDate);
      setSelectedDateBookings(bookingsResponse);
    } catch (err) {
      console.error('Error loading bookings for selected date:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleRefresh = () => {
    loadDashboardData();
    loadSelectedDateBookings();
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'checked-in':
        return 'text-blue-600 bg-blue-100';
      case 'checked-out':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getBookingTypeColor = (bookingType) => {
    switch (bookingType) {
      case 'reception':
        return 'text-blue-600 bg-blue-100';
      case 'online':
        return 'text-purple-600 bg-purple-100';
      case 'pool':
        return 'text-cyan-600 bg-cyan-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Reception Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.name || 'Receptionist'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats Cards */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Room Statistics */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Room Occupancy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.rooms?.currentlyOccupied || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    of {dashboardStats.rooms?.totalRooms || 0} rooms
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Check-ins</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.rooms?.todaysCheckIns || 0}
                  </p>
                  <p className="text-xs text-gray-500">Room bookings</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Waves className="h-6 w-6 text-cyan-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pool Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats.pools?.todaysBookings || 0}
                </p>
                <p className="text-xs text-gray-500">Today</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.overview?.totalPendingBookings || 0}
                  </p>
                  <p className="text-xs text-gray-500">Require attention</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: Activity },
                { id: 'rooms', name: 'Room Bookings', icon: Building },
                { id: 'pools', name: 'Pool Bookings', icon: Waves },
                { id: 'calendar', name: 'Calendar View', icon: Calendar }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Activity */}
                {dashboardStats?.recentActivity && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Today's Check-ins */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Today's Check-ins</h4>
                        <div className="space-y-2">
                          {dashboardStats.recentActivity.todayRoomCheckIns?.slice(0, 3).map((booking, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span className="font-medium">
                                {booking.guestName || booking.fullName || booking.guestDetails?.name}
                              </span>
                              <span className="text-gray-500">
                                Room {booking.roomNumber || booking.bookingDetails?.roomNumber}
                              </span>
                            </div>
                          ))}
                          {(!dashboardStats.recentActivity.todayRoomCheckIns || 
                            dashboardStats.recentActivity.todayRoomCheckIns.length === 0) && (
                            <p className="text-gray-500 text-sm">No check-ins today</p>
                          )}
                        </div>
                      </div>

                      {/* Today's Pool Bookings */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Today's Pool Bookings</h4>
                        <div className="space-y-2">
                          {dashboardStats.recentActivity.todayPoolBookings?.slice(0, 3).map((booking, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span className="font-medium">
                                {booking.fullName || booking.name}
                              </span>
                              <span className="text-gray-500">
                                {booking.checkInTime} - {booking.checkOutTime}
                              </span>
                            </div>
                          ))}
                          {(!dashboardStats.recentActivity.todayPoolBookings || 
                            dashboardStats.recentActivity.todayPoolBookings.length === 0) && (
                            <p className="text-gray-500 text-sm">No pool bookings today</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'calendar' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Bookings for {formatDate(selectedDate)}
                  </h3>
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => handleDateSelect(new Date(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                {refreshing ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading bookings...</p>
                  </div>
                ) : selectedDateBookings ? (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total Bookings:</span>
                          <span className="font-medium ml-1">{selectedDateBookings.summary?.totalBookings || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Room Bookings:</span>
                          <span className="font-medium ml-1">{selectedDateBookings.summary?.roomBookings?.total || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Pool Bookings:</span>
                          <span className="font-medium ml-1">{selectedDateBookings.summary?.poolBookings || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Reception Bookings:</span>
                          <span className="font-medium ml-1">{selectedDateBookings.summary?.roomBookings?.reception || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bookings List */}
                    <div className="space-y-4">
                      {/* Room Bookings */}
                      {[...selectedDateBookings.bookings?.rooms?.reception || [], 
                        ...selectedDateBookings.bookings?.rooms?.online || []].map((booking) => (
                        <div key={booking.id} className="bg-white border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingTypeColor(booking.bookingType)}`}>
                                  {booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1)}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900">{booking.guestName}</h4>
                              <p className="text-sm text-gray-600">Room {booking.roomNumber}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                              </p>
                            </div>
                            <div className="text-right">
                              <Building className="h-5 w-5 text-gray-400 mb-1" />
                              <p className="text-xs text-gray-500">Room Booking</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Pool Bookings */}
                      {selectedDateBookings.bookings?.pools?.map((booking) => (
                        <div key={booking.id} className="bg-white border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingTypeColor('pool')}`}>
                                  Pool
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900">{booking.guestName}</h4>
                              <p className="text-sm text-gray-600">{booking.poolName}</p>
                              <p className="text-sm text-gray-500">
                                {booking.checkInTime} - {booking.checkOutTime} ({booking.guestCount} guests)
                              </p>
                            </div>
                            <div className="text-right">
                              <Waves className="h-5 w-5 text-cyan-500 mb-1" />
                              <p className="text-xs text-gray-500">Pool Booking</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {selectedDateBookings.summary?.totalBookings === 0 && (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No bookings for this date</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Select a date to view bookings</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rooms' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Room Booking Management</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate('/reception/room-booking')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      New Room Booking
                    </button>
                    <button
                      onClick={() => navigate('/reception/bookings')}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                    >
                      View All Bookings
                    </button>
                  </div>
                </div>

                {/* Room Statistics */}
                {dashboardStats?.rooms && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Building className="h-8 w-8 text-blue-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-blue-600">Total Rooms</p>
                          <p className="text-2xl font-bold text-blue-900">{dashboardStats.rooms.totalRooms}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-600">Available</p>
                          <p className="text-2xl font-bold text-green-900">{dashboardStats.rooms.totalAvailable}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-red-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-600">Occupied</p>
                          <p className="text-2xl font-bold text-red-900">{dashboardStats.rooms.occupied}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pending Room Bookings */}
                {dashboardStats?.recentActivity?.pendingRoomBookings && (
                  <div className="bg-white border rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-medium text-gray-900">Pending Room Bookings</h4>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {dashboardStats.recentActivity.pendingRoomBookings.length > 0 ? (
                        dashboardStats.recentActivity.pendingRoomBookings.map((booking, index) => (
                          <div key={index} className="px-6 py-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">
                                  {booking.guestName || booking.fullName || booking.guestDetails?.name}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Room {booking.roomNumber || booking.bookingDetails?.roomNumber}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(booking.checkIn || booking.bookingDetails?.checkIn)} - 
                                  {formatDate(booking.checkOut || booking.bookingDetails?.checkOut)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingTypeColor(booking.bookingType)}`}>
                                  {booking.bookingType === 'reception' ? 'Reception' : 'Online'}
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100">
                                  Pending
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-6 py-8 text-center">
                          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                          <p className="text-gray-500">No pending room bookings</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pools' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Pool Booking Management</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate('/reception/pool-booking')}
                      className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700"
                    >
                      New Pool Booking
                    </button>
                    <button
                      onClick={() => navigate('/reception/pool-bookings')}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                    >
                      View All Pool Bookings
                    </button>
                  </div>
                </div>

                {/* Pool Statistics */}
                {dashboardStats?.pools && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-cyan-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Waves className="h-8 w-8 text-cyan-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-cyan-600">Total Pools</p>
                          <p className="text-2xl font-bold text-cyan-900">{dashboardStats.pools.totalPools}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-600">Available</p>
                          <p className="text-2xl font-bold text-green-900">{dashboardStats.pools.availablePools}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Activity className="h-8 w-8 text-blue-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-blue-600">Today's Bookings</p>
                          <p className="text-2xl font-bold text-blue-900">{dashboardStats.pools.todaysBookings}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pending Pool Bookings */}
                {dashboardStats?.recentActivity?.pendingPoolBookings && (
                  <div className="bg-white border rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-medium text-gray-900">Pending Pool Bookings</h4>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {dashboardStats.recentActivity.pendingPoolBookings.length > 0 ? (
                        dashboardStats.recentActivity.pendingPoolBookings.map((booking, index) => (
                          <div key={index} className="px-6 py-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">
                                  {booking.fullName || booking.name}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {booking.poolId?.name || 'Pool'} - {booking.guestCount || booking.peopleCount} guests
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(booking.date || booking.checkIn)} | 
                                  {booking.checkInTime} - {booking.checkOutTime}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 rounded-full text-xs font-medium text-cyan-600 bg-cyan-100">
                                  Pool
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100">
                                  Pending
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-6 py-8 text-center">
                          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                          <p className="text-gray-500">No pending pool bookings</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Today's Pool Activity */}
                {dashboardStats?.recentActivity?.todayPoolBookings && (
                  <div className="bg-white border rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-medium text-gray-900">Today's Pool Activity</h4>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {dashboardStats.recentActivity.todayPoolBookings.length > 0 ? (
                        dashboardStats.recentActivity.todayPoolBookings.map((booking, index) => (
                          <div key={index} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">
                                  {booking.fullName || booking.name}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {booking.poolId?.name || 'Pool'} - {booking.guestCount || booking.peopleCount} guests
                                </p>
                                <p className="text-sm text-gray-500">
                                  {booking.checkInTime} - {booking.checkOutTime}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-6 py-8 text-center">
                          <Waves className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No pool bookings today</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedReceptionHome;
