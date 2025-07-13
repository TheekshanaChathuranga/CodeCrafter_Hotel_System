import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Reception API functions
export const receptionAPI = {
  // Get all bookings (both reception and online)
  getAllBookings: async () => {
    try {
      // Try the working endpoint first (now returns combined bookings)
      const response = await api.get("/bookings");

      // Check if response has the expected structure
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn("Unexpected response structure:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching bookings from /bookings:", error);
      // Fallback to try receptionBookings
      try {
        const response = await api.get("/receptionBookings");

        // Check if response has the expected structure
        if (response.data && response.data.success && response.data.data) {
          return Array.isArray(response.data.data) ? response.data.data : [];
        } else if (Array.isArray(response.data)) {
          return response.data;
        } else {
          console.warn(
            "Unexpected fallback response structure:",
            response.data
          );
          return [];
        }
      } catch (fallbackError) {
        console.error(
          "Error fetching bookings from /receptionBookings:",
          fallbackError
        );
        throw new Error("Unable to fetch bookings from any endpoint");
      }
    }
  },

  // Get recent bookings (last 30 days)
  getRecentBookings: async () => {
    try {
      const allBookings = await receptionAPI.getAllBookings();

      // Ensure allBookings is an array
      if (!Array.isArray(allBookings)) {
        console.warn("getAllBookings did not return an array:", allBookings);
        return [];
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return allBookings
        .filter((booking) => {
          const checkIn = new Date(
            booking.bookingDetails?.checkIn || booking.checkIn
          );
          const checkOut = new Date(
            booking.bookingDetails?.checkOut || booking.checkOut
          );
          return checkIn >= thirtyDaysAgo || checkOut >= thirtyDaysAgo;
        })
        .slice(0, 10); // Limit to 10 most recent
    } catch (error) {
      console.error("Error fetching recent bookings:", error);
      throw error;
    }
  },

  // Get today's bookings
  getTodaysBookings: async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const allBookings = await receptionAPI.getAllBookings();

      // Ensure allBookings is an array
      if (!Array.isArray(allBookings)) {
        console.warn("getAllBookings did not return an array:", allBookings);
        return [];
      }

      const todaysBookings = allBookings.filter((booking) => {
        const checkInDate = new Date(
          booking.bookingDetails?.checkIn || booking.checkIn
        )
          .toISOString()
          .split("T")[0];
        const checkOutDate = new Date(
          booking.bookingDetails?.checkOut || booking.checkOut
        )
          .toISOString()
          .split("T")[0];
        return checkInDate === today || checkOutDate === today;
      });

      // If no bookings for today, return recent bookings as fallback
      if (todaysBookings.length === 0) {
        const recentBookings = await receptionAPI.getRecentBookings();
        return recentBookings.slice(0, 5); // Show 5 most recent as "today's" for demo
      }

      return todaysBookings;
    } catch (error) {
      console.error("Error fetching today's bookings:", error);
      throw error;
    }
  },

  // Get bookings for a specific date range
  getBookingsByDateRange: async (startDate, endDate) => {
    try {
      const allBookings = await receptionAPI.getAllBookings();

      // Ensure allBookings is an array
      if (!Array.isArray(allBookings)) {
        console.warn("getAllBookings did not return an array:", allBookings);
        return [];
      }

      return allBookings.filter((booking) => {
        const checkIn = new Date(
          booking.bookingDetails?.checkIn || booking.checkIn
        );
        const checkOut = new Date(
          booking.bookingDetails?.checkOut || booking.checkOut
        );
        const start = new Date(startDate);
        const end = new Date(endDate);

        return (
          (checkIn >= start && checkIn <= end) ||
          (checkOut >= start && checkOut <= end) ||
          (checkIn <= start && checkOut >= end)
        );
      });
    } catch (error) {
      console.error("Error fetching bookings by date range:", error);
      throw error;
    }
  },

  // Get available rooms
  getAvailableRooms: async (checkIn, checkOut) => {
    try {
      const response = await api.get("/receptionRooms/available", {
        params: { checkIn, checkOut },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      throw error;
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    try {
      // Try the working endpoint first
      const response = await api.patch(`/bookings/${bookingId}`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating booking status via /bookings:", error);
      // Fallback to try receptionBookings
      try {
        const response = await api.patch(`/receptionBookings/${bookingId}`, {
          status,
        });
        return response.data;
      } catch (fallbackError) {
        console.error(
          "Error updating booking status via /receptionBookings:",
          fallbackError
        );
        throw new Error("Unable to update booking status");
      }
    }
  },

  // Get dashboard stats with fallback
  getDashboardStats: async () => {
    try {
      const response = await api.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      console.error(
        "Dashboard stats endpoint not available, calculating locally:",
        error
      );

      // Fallback: Calculate stats locally from bookings
      try {
        const allBookings = await receptionAPI.getAllBookings();
        return receptionAPI.calculateStatsLocally(allBookings);
      } catch (bookingsError) {
        console.error(
          "Unable to fetch bookings for local calculation:",
          bookingsError
        );
        // Return default/empty stats
        return {
          todaysCheckIns: 0,
          todaysCheckOuts: 0,
          currentlyOccupied: 0,
          totalAvailable: 30, // Default total rooms
          availableRooms: [
            { type: "Single Room", available: 5, total: 5, occupied: 0 },
            { type: "Double Room", available: 15, total: 15, occupied: 0 },
            { type: "Triple Room", available: 10, total: 10, occupied: 0 },
          ],
          todaysRevenue: 0,
          monthlyRevenue: 0,
          upcomingCheckIns: 0,
          totalBookings: 0,
          totalRooms: 30,
        };
      }
    }
  },

  // Local stats calculation fallback
  calculateStatsLocally: (allBookings) => {
    // Ensure allBookings is an array
    if (!Array.isArray(allBookings)) {
      console.warn("calculateStatsLocally received non-array:", allBookings);
      allBookings = [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Calculate stats for today
    const todaysCheckIns = allBookings.filter((booking) => {
      const checkIn = new Date(
        booking.bookingDetails?.checkIn || booking.checkIn
      );
      return checkIn >= today && checkIn <= todayEnd;
    }).length;

    const todaysCheckOuts = allBookings.filter((booking) => {
      const checkOut = new Date(
        booking.bookingDetails?.checkOut || booking.checkOut
      );
      return checkOut >= today && checkOut <= todayEnd;
    }).length;

    const currentlyOccupied = allBookings.filter((booking) => {
      const checkIn = new Date(
        booking.bookingDetails?.checkIn || booking.checkIn
      );
      const checkOut = new Date(
        booking.bookingDetails?.checkOut || booking.checkOut
      );
      return (
        checkIn <= today && checkOut > today && booking.status === "checked-in"
      );
    }).length;

    // If no activity today, show recent activity stats instead
    const hasActivityToday =
      todaysCheckIns > 0 || todaysCheckOuts > 0 || currentlyOccupied > 0;

    let displayStats = {
      todaysCheckIns,
      todaysCheckOuts,
      currentlyOccupied,
    };

    if (!hasActivityToday) {
      // Show recent activity stats (last 7 days)
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const recentCheckIns = allBookings.filter((booking) => {
        const checkIn = new Date(
          booking.bookingDetails?.checkIn || booking.checkIn
        );
        return checkIn >= weekAgo && checkIn <= todayEnd;
      }).length;

      const recentCheckOuts = allBookings.filter((booking) => {
        const checkOut = new Date(
          booking.bookingDetails?.checkOut || booking.checkOut
        );
        return checkOut >= weekAgo && checkOut <= todayEnd;
      }).length;

      displayStats = {
        todaysCheckIns: recentCheckIns,
        todaysCheckOuts: recentCheckOuts,
        currentlyOccupied: allBookings.filter(
          (booking) =>
            booking.status === "checked-in" || booking.status === "confirmed"
        ).length,
      };
    }

    // Room availability by type
    const roomTypes = ["Single Room", "Double Room", "Triple Room"];
    const totalRoomsByType = {
      "Single Room": 5,
      "Double Room": 15,
      "Triple Room": 10,
    };

    const occupiedByType = {};
    roomTypes.forEach((type) => {
      occupiedByType[type] = allBookings.filter((booking) => {
        const checkIn = new Date(
          booking.bookingDetails?.checkIn || booking.checkIn
        );
        const checkOut = new Date(
          booking.bookingDetails?.checkOut || booking.checkOut
        );
        const roomType = booking.bookingDetails?.roomType || booking.roomType;
        return (
          roomType === type &&
          checkIn <= today &&
          checkOut > today &&
          (booking.status === "checked-in" || booking.status === "confirmed")
        );
      }).length;
    });

    const availableRooms = roomTypes.map((type) => ({
      type,
      available: totalRoomsByType[type] - (occupiedByType[type] || 0),
      total: totalRoomsByType[type],
      occupied: occupiedByType[type] || 0,
    }));

    // Calculate revenue
    const monthlyRevenue = allBookings
      .filter((booking) => {
        const checkInDate = booking.bookingDetails?.checkIn || booking.checkIn;
        if (!checkInDate) return false;
        const checkIn = new Date(checkInDate);
        return (
          checkIn.getMonth() === today.getMonth() &&
          checkIn.getFullYear() === today.getFullYear()
        );
      })
      .reduce((sum, booking) => {
        const amount =
          booking.paymentDetails?.totalAmount || booking.totalAmount || 0;
        return sum + amount;
      }, 0);

    return {
      ...displayStats,
      totalAvailable: availableRooms.reduce(
        (sum, room) => sum + room.available,
        0
      ),
      availableRooms,
      todaysRevenue: hasActivityToday ? 0 : monthlyRevenue, // Show monthly if no today activity
      monthlyRevenue,
      upcomingCheckIns: allBookings.filter((booking) => {
        const checkInDate = booking.bookingDetails?.checkIn || booking.checkIn;
        if (!checkInDate) return false;
        const checkIn = new Date(checkInDate);
        return checkIn > today && booking.status === "confirmed";
      }).length,
      totalBookings: allBookings.length,
      totalRooms: Object.values(totalRoomsByType).reduce(
        (sum, count) => sum + count,
        0
      ),
      isShowingRecentData: !hasActivityToday,
    };
  },

  // Get bookings for a specific date with fallback
  getBookingsForDate: async (date) => {
    try {
      const formattedDate = date.toISOString().split("T")[0];
      const response = await api.get(`/dashboard/bookings/${formattedDate}`);

      // Check if response has the expected structure
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn("Unexpected response structure:", response.data);
        return [];
      }
    } catch (error) {
      console.error(
        "Dashboard bookings endpoint not available, filtering locally:",
        error
      );

      // Fallback: Filter from all bookings
      try {
        const allBookings = await receptionAPI.getAllBookings();

        // Ensure allBookings is an array
        if (!Array.isArray(allBookings)) {
          console.warn("getAllBookings did not return an array:", allBookings);
          return [];
        }

        const dateStr = date.toISOString().split("T")[0];

        return allBookings.filter((booking) => {
          const checkIn = new Date(
            booking.bookingDetails?.checkIn || booking.checkIn
          )
            .toISOString()
            .split("T")[0];
          const checkOut = new Date(
            booking.bookingDetails?.checkOut || booking.checkOut
          )
            .toISOString()
            .split("T")[0];
          return checkIn <= dateStr && checkOut >= dateStr;
        });
      } catch (fallbackError) {
        console.error("Fallback booking filter also failed:", fallbackError);
        return [];
      }
    }
  },

  // Test API connection
  testConnection: async () => {
    try {
      const response = await api.get("/health");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("API connection test failed:", error);
      return { success: false, error: error.message };
    }
  },
};

export default api;
