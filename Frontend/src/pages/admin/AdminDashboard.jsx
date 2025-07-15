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
  Activity,
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
    totalRevenue: 0,
    totalUsers: 0,
    totalPools: 0,
    poolBookings: 0,
    menuItems: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const authHeaders = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Load all admin statistics using individual API endpoints for reliability
      const [
        roomsResponse,
        bookingsResponse,
        usersResponse,
        poolsResponse,
        menuResponse,
        poolBookingsResponse,
        eventsResponse,
      ] = await Promise.all([
        axios.get(`${API_URL}/manage/rooms`, authHeaders),
        axios.get(`${API_URL}/bookings`, authHeaders).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/manage/users?limit=1`, authHeaders).catch(() => ({ data: { total: 0 } })),
        axios.get(`${API_URL}/pools`, authHeaders),
        axios.get(`${API_URL}/fooditems`, authHeaders).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/pool-bookings/?limit=50`, authHeaders).catch(() => ({ data: { bookings: [] } })),
        axios.get(`${API_URL}/events/`, authHeaders).catch((error) => {
          console.error("Error fetching events:", error);
          return { data: [] };
        }),
      ]);

      console.log("API Responses:", {
        rooms: roomsResponse.data?.length || 0,
        bookings: Array.isArray(bookingsResponse.data) ? bookingsResponse.data.length : (bookingsResponse.data?.bookings?.length || 0),
        users: usersResponse.data?.total || 0,
        pools: poolsResponse.data?.length || 0,
        menuItems: Array.isArray(menuResponse.data) ? menuResponse.data.length : 0,
        poolBookings: poolBookingsResponse.data?.bookings?.length || poolBookingsResponse.data?.length || 0,
        events: Array.isArray(eventsResponse.data) ? eventsResponse.data.length : 0,
      });

      const rooms = roomsResponse.data;
      const bookings = Array.isArray(bookingsResponse.data)
        ? bookingsResponse.data
        : bookingsResponse.data.bookings || [];
      const totalUsers = usersResponse.data?.total || 0;
      const pools = poolsResponse.data;
      const menuItems = Array.isArray(menuResponse.data)
        ? menuResponse.data
        : [];
      const poolBookings = poolBookingsResponse.data?.bookings || 
        (Array.isArray(poolBookingsResponse.data) ? poolBookingsResponse.data : []);
      const events = Array.isArray(eventsResponse.data)
        ? eventsResponse.data
        : [];

      console.log("Pool bookings:", poolBookings.length);
      console.log("Events:", events.length);
      console.log("Room bookings:", bookings.length);

      // Calculate statistics
      const availableRooms = rooms.filter(
        (room) => room.roomStatus === "Available"
      ).length;

      // Calculate total revenue from confirmed/approved bookings that have actual total prices
      // Using case-insensitive status matching to handle different status formats
      const roomRevenue = bookings
        .filter((booking) => {
          const status = booking.status?.toLowerCase();
          const hasValidPrice = booking.totalPrice && booking.totalPrice > 0;
          const isApproved = status === "confirmed" || status === "approved" || status === "accepted";
          console.log("Room booking filter:", { id: booking._id, status: booking.status, totalPrice: booking.totalPrice, isApproved, hasValidPrice });
          return isApproved && hasValidPrice;
        })
        .reduce((sum, booking) => sum + booking.totalPrice, 0);

      const poolRevenue = poolBookings
        .filter((booking) => {
          const status = booking.status?.toLowerCase();
          const hasValidPrice = booking.totalAmount && booking.totalAmount > 0;
          const isApproved = status === "confirmed" || status === "approved" || status === "accepted";
          console.log("Pool booking filter:", { id: booking._id, status: booking.status, totalAmount: booking.totalAmount, isApproved, hasValidPrice });
          return isApproved && hasValidPrice;
        })
        .reduce((sum, booking) => sum + booking.totalAmount, 0);

      const eventRevenue = events
        .filter((event) => {
          const status = event.status?.toLowerCase();
          const hasValidPrice = event.grandTotal && event.grandTotal > 0;
          const isApproved = status === "confirmed" || status === "approved" || status === "accepted";
          console.log("Event filter:", { eventId: event.eventId, status: event.status, grandTotal: event.grandTotal, isApproved, hasValidPrice });
          return isApproved && hasValidPrice;
        })
        .reduce((sum, event) => sum + event.grandTotal, 0);

      const totalRevenue = roomRevenue + poolRevenue + eventRevenue;

      // Temporary fallback: Calculate revenue from ALL bookings with valid prices (regardless of status)
      const allRoomRevenue = bookings
        .filter(b => b.totalPrice && b.totalPrice > 0)
        .reduce((sum, b) => sum + b.totalPrice, 0);
      
      const allPoolRevenue = poolBookings
        .filter(b => b.totalAmount && b.totalAmount > 0)
        .reduce((sum, b) => sum + b.totalAmount, 0);
      
      const allEventRevenue = events
        .filter(e => e.grandTotal && e.grandTotal > 0)
        .reduce((sum, e) => sum + e.grandTotal, 0);
      
      const totalRevenueAllStatuses = allRoomRevenue + allPoolRevenue + allEventRevenue;

      console.log("Revenue breakdown:", {
        roomRevenue,
        poolRevenue,
        eventRevenue,
        totalRevenue,
        totalRevenueAllStatuses,
        breakdown: {
          approvedRoom: roomRevenue,
          approvedPool: poolRevenue,
          approvedEvent: eventRevenue,
          allRoom: allRoomRevenue,
          allPool: allPoolRevenue,
          allEvent: allEventRevenue
        }
      });

      setDashboardStats({
        totalRooms: rooms.length,
        availableRooms,
        totalRevenue: totalRevenue > 0 ? totalRevenue : totalRevenueAllStatuses,
        totalUsers: totalUsers,
        totalPools: pools.length,
        poolBookings: poolBookings.length,
        menuItems: menuItems.length,
      });
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
        <div
          className={`p-3 rounded-full ${color
            .replace("border-l", "bg")
            .replace("500", "100")}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
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
          Welcome back, {user.fullName || user.username}! Here's your hotel
          overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Rooms"
          value={dashboardStats.totalRooms}
          icon={<Hotel className="h-6 w-6 text-blue-600" />}
          color="border-l-blue-500"
          description={`${dashboardStats.availableRooms} available`}
          onClick={() => navigate("/admin/rooms")}
        />

        <StatCard
          title="Revenue"
          value={formatCurrency(dashboardStats.totalRevenue)}
          icon={<DollarSign className="h-6 w-6 text-yellow-600" />}
          color="border-l-yellow-500"
          description="From confirmed bookings"
          onClick={() => navigate("/admin/reservations")}
        />

        <StatCard
          title="Total Users"
          value={dashboardStats.totalUsers}
          icon={<Users className="h-6 w-6 text-purple-600" />}
          color="border-l-purple-500"
          description="Registered users"
          onClick={() => navigate("/admin/users")}
        />

        <StatCard
          title="Pool Facilities"
          value={dashboardStats.totalPools}
          icon={<LifeBuoy className="h-6 w-6 text-teal-600" />}
          color="border-l-teal-500"
          description={`${dashboardStats.poolBookings} total bookings`}
          onClick={() => navigate("/admin/pools")}
        />

        <StatCard
          title="Menu Items"
          value={dashboardStats.menuItems}
          icon={<Utensils className="h-6 w-6 text-orange-600" />}
          color="border-l-orange-500"
          description="Food & beverages"
          onClick={() => navigate("/admin/menu-management")}
        />

        <StatCard
          title="Notifications"
          value={unreadBookings}
          icon={<Bell className="h-6 w-6 text-red-600" />}
          color="border-l-red-500"
          description="Unread alerts"
          onClick={() => navigate("/admin/bookingNotifications")}
        />
      </div>

      {/* Booking Management */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Booking Management
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room Bookings */}
          <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <Hotel className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Room Bookings</h3>
            <p className="text-gray-600 mb-4">
              Manage all room reservations and bookings
            </p>
            <button
              onClick={() => navigate("/admin/reservations")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View Room Bookings
            </button>
          </div>

          {/* Pool Bookings */}
          <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <LifeBuoy className="h-12 w-12 text-teal-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pool Bookings</h3>
            <p className="text-gray-600 mb-4">
              Manage all pool facility reservations
            </p>
            <button
              onClick={() => navigate("/admin/reservations")}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              View Pool Bookings
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/admin/rooms")}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <Hotel className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Manage Rooms</p>
          </button>

          <button
            onClick={() => navigate("/admin/users")}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Manage Users</p>
          </button>

          <button
            onClick={() => navigate("/admin/pools")}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <LifeBuoy className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Manage Pools</p>
          </button>

          <button
            onClick={() => navigate("/admin/bookingNotifications")}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 relative"
          >
            <Bell className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Notifications</p>
            {unreadBookings > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {unreadBookings > 9 ? "9+" : unreadBookings}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
