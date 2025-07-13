import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./UserAuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [unreadBookings, setUnreadBookings] = useState(0);
  const { user } = useAuth();

  console.log(
    "SocketProvider initialized, user:",
    user?.username,
    "role:",
    user?.role
  );

  // Fetch initial unread count from database when admin logs in
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user && user.role === "admin") {
        try {
          const token = localStorage.getItem("token");
          console.log("Fetching unread count...");
          console.log(
            "Token from localStorage:",
            token ? "Token present" : "No token"
          );
          console.log("User:", user);

          const response = await fetch(
            "http://localhost:5000/api/notifications/unread-count",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log("Response status:", response.status);
          console.log("Response OK:", response.ok);

          if (response.ok) {
            const data = await response.json();
            console.log(
              "Initial unread count from database:",
              data.unreadCount
            );
            setUnreadBookings(data.unreadCount);
          } else {
            const errorData = await response.json();
            console.error("Failed to fetch unread count:", errorData);
          }
        } catch (error) {
          console.error("Error fetching unread count:", error);
        }
      }
    };

    fetchUnreadCount();
  }, [user]);

  useEffect(() => {
    if (user && user.role === "admin") {
      console.log("Initializing socket connection for admin:", user.username);
      console.log("User object:", user);
      // Initialize socket connection for admin users
      const newSocket = io(
        import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
        {
          // Allow polling then upgrade to websocket automatically for
          // maximum compatibility. You can force websocket later if desired.
          auth: {
            userId: user._id || user.id,
            role: user.role,
          },
          // no cookies required in dev environment
        }
      );

      newSocket.on("connect", () => {
        console.log("Socket connected successfully:", newSocket.id);
        console.log("Socket transport:", newSocket.io.engine.transport.name);
        // Manually identify as admin
        newSocket.emit("admin-connect", user._id || user.id);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      // Listen for new booking notifications
      newSocket.on("booking-created", (data) => {
        console.log("New room booking notification received:", data);
        setUnreadBookings((prev) => {
          const newCount = prev + 1;
          console.log("Updated unread count:", newCount);
          return newCount;
        });
      });

      // Listen for new pool booking notifications
      newSocket.on("pool-booking-created", (data) => {
        console.log("New pool booking notification received:", data);
        console.log("Current user role:", user.role);
        console.log("Notification data details:", {
          bookingId: data.bookingId,
          fullName: data.fullName,
          guestCount: data.guestCount,
          status: data.status
        });
        setUnreadBookings((prev) => {
          const newCount = prev + 1;
          console.log("Updated unread count for pool booking from", prev, "to", newCount);
          return newCount;
        });
      });

      // Listen for booking confirmation events to potentially decrease unread count
      newSocket.on("booking-confirmed", () => {
        console.log("Booking confirmed, decreasing unread count");
        // Optionally decrease unread count when bookings are confirmed
        setUnreadBookings((prev) => Math.max(0, prev - 1));
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      setSocket(newSocket);

      return () => {
        console.log("Cleaning up socket connection");
        newSocket.close();
      };
    } else {
      // Reset socket and unread count for non-admin users
      console.log("User is not admin, resetting socket");
      setSocket(null);
      setUnreadBookings(0);
    }
  }, [user]);

  const markBookingsAsRead = async () => {
    console.log("=== markBookingsAsRead function called ===");
    console.log("Current user:", user);
    console.log("User role:", user?.role);
    console.log("Current unread count:", unreadBookings);

    // Don't set to 0 immediately - wait for API response

    // Mark notifications as read in database first
    if (user && user.role === "admin") {
      try {
        const token = localStorage.getItem("token");
        console.log("Marking notifications as read...");
        console.log("Token available:", !!token);

        console.log("About to make API call to mark-read endpoint");
        const response = await fetch(
          "http://localhost:5000/api/notifications/mark-read",
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}), // Mark all as read
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log("Notifications marked as read in database:", result);

          // Now set local state to 0 since API call was successful
          setUnreadBookings(0);

          // Optional: Refetch count to ensure sync
          const countResponse = await fetch(
            "http://localhost:5000/api/notifications/unread-count",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (countResponse.ok) {
            const countData = await countResponse.json();
            console.log(
              "Verified unread count after marking as read:",
              countData.unreadCount
            );
            setUnreadBookings(countData.unreadCount);
          }
        } else {
          const errorData = await response.json();
          console.error("Failed to mark notifications as read:", errorData);
        }
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    } else {
      console.log("User is not admin or user is null, skipping mark as read");
    }

    console.log("=== markBookingsAsRead function completed ===");
  };

  const value = {
    socket,
    unreadBookings,
    markBookingsAsRead,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
