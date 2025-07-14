import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/UserAuthContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useSocket } from "../../context/SocketContext";
import {
  Hotel,
  Users,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  LifeBuoy,
  Utensils,
  Bell,
  Activity
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { unreadBookings } = useSocket();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    todayBookings: 0,
    totalUsers: 0,
    totalPools: 0,
    poolBookings: 0,
    menuItems: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentPoolBookings, setRecentPoolBookings] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all admin statistics using correct API endpoints
      const [
        roomsResponse,
        bookingsResponse,
        usersResponse,
        poolsResponse,
        menuResponse
      ] = await Promise.all([
        axios.get(`${API_URL}/manage/rooms`),
        axios.get(`${API_URL}/bookings`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/manage/users`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/pools`),
        axios.get(`${API_URL}/fooditems`).catch(() => ({ data: [] }))
      ]);

      const rooms = roomsResponse.data;
      const bookings = Array.isArray(bookingsResponse.data) ? bookingsResponse.data : bookingsResponse.data.bookings || [];
      const users = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.users || [];
      const pools = poolsResponse.data;
      const menuItems = Array.isArray(menuResponse.data) ? menuResponse.data : [];

      // Calculate statistics
      const availableRooms = rooms.filter(room => room.roomStatus === 'Available').length;
      const pendingBookings = bookings.filter(booking => booking.status === 'pending').length;
      const todayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt || booking.checkIn);
        const today = new Date();
        return bookingDate.toDateString() === today.toDateString();
      }).length;

      const totalRevenue = bookings.reduce((sum, booking) => {
        return sum + (booking.totalAmount || 0);
      }, 0);

      setDashboardStats({
        totalRooms: rooms.length,
        availableRooms,
        totalBookings: bookings.length,
        pendingBookings,
        totalRevenue,
        todayBookings,
        totalUsers: users.length,
        totalPools: pools.length,
        poolBookings: 0, // We'll set this to 0 for now since pool-bookings endpoint doesn't exist
        menuItems: menuItems.length
      });

      setRecentBookings(bookings.slice(0, 5));
      setRecentPoolBookings([]); // Empty array for now since endpoint doesn't exist

    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, description, onClick }) => (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color} cursor-pointer hover:shadow-lg transition-shadow`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-l', 'bg').replace('500', '100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user.fullName || user.username}! Here's your hotel overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Rooms"
          value={dashboardStats.totalRooms}
          icon={<Hotel className="h-6 w-6 text-blue-600" />}
          color="border-l-blue-500"
          description={`${dashboardStats.availableRooms} available`}
          onClick={() => navigate('/admin/rooms')}
        />
        
        <StatCard
          title="Room Bookings"
          value={dashboardStats.totalBookings}
          icon={<CalendarCheck className="h-6 w-6 text-green-600" />}
          color="border-l-green-500"
          description={`${dashboardStats.pendingBookings} pending`}
          onClick={() => navigate('/admin/reservations')}
        />

        <StatCard
          title="Revenue"
          value={formatCurrency(dashboardStats.totalRevenue)}
          icon={<DollarSign className="h-6 w-6 text-yellow-600" />}
          color="border-l-yellow-500"
          description="Total earnings"
          onClick={() => navigate('/admin/reservations')}
        />

        <StatCard
          title="Total Users"
          value={dashboardStats.totalUsers}
          icon={<Users className="h-6 w-6 text-purple-600" />}
          color="border-l-purple-500"
          description="Registered users"
          onClick={() => navigate('/admin/users')}
        />

        <StatCard
          title="Pool Facilities"
          value={dashboardStats.totalPools}
          icon={<LifeBuoy className="h-6 w-6 text-teal-600" />}
          color="border-l-teal-500"
          description={`${dashboardStats.poolBookings} bookings`}
          onClick={() => navigate('/admin/pools')}
        />

        <StatCard
          title="Today's Bookings"
          value={dashboardStats.todayBookings}
          icon={<Clock className="h-6 w-6 text-indigo-600" />}
          color="border-l-indigo-500"
          description="New today"
          onClick={() => navigate('/admin/reservations')}
        />

        <StatCard
          title="Menu Items"
          value={dashboardStats.menuItems}
          icon={<Utensils className="h-6 w-6 text-orange-600" />}
          color="border-l-orange-500"
          description="Food & beverages"
          onClick={() => navigate('/admin/menu-management')}
        />

        <StatCard
          title="Notifications"
          value={unreadBookings}
          icon={<Bell className="h-6 w-6 text-red-600" />}
          color="border-l-red-500"
          description="Unread alerts"
          onClick={() => navigate('/admin/bookingNotifications')}
        />
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Room Bookings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Room Bookings</h2>
            <button 
              onClick={() => navigate('/admin/reservations')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          {recentBookings.length > 0 ? (
            <div className="space-y-3">
              {recentBookings.map((booking, index) => (
                <div key={booking._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {booking.fullName || booking.guestName || 'Guest'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Room {booking.roomNumber || 'N/A'} • {formatDate(booking.createdAt || booking.checkIn)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      booking.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(booking.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CalendarCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No recent bookings</p>
            </div>
          )}
        </div>

        {/* Recent Pool Bookings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Pool Bookings</h2>
            <button 
              onClick={() => navigate('/receptionist/pool-bookings')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          {recentPoolBookings.length > 0 ? (
            <div className="space-y-3">
              {recentPoolBookings.map((booking, index) => (
                <div key={booking._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {booking.fullName || booking.name || 'Guest'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.guestCount || booking.peopleCount} guests • {formatDate(booking.createdAt || booking.date)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      booking.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <LifeBuoy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No recent pool bookings</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/admin/rooms')}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <Hotel className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Manage Rooms</p>
          </button>
          
          <button
            onClick={() => navigate('/admin/users')}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Manage Users</p>
          </button>
          
          <button
            onClick={() => navigate('/admin/pools')}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <LifeBuoy className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Manage Pools</p>
          </button>
          
          <button
            onClick={() => navigate('/admin/bookingNotifications')}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 relative"
          >
            <Bell className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Notifications</p>
            {unreadBookings > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {unreadBookings > 9 ? '9+' : unreadBookings}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
