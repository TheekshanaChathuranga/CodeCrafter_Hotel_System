import { Server } from "socket.io";

// Store admin sockets for real-time notifications
const adminSockets = new Map();

export const configureSocket = (httpServer) => {
  const io = new Server(httpServer, {
    // Allow both polling and websocket for maximum compatibility
    transports: ["polling", "websocket"],
    cors: {
      origin: "*", // Allow any origin during development
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    },
    allowEIO3: true, // Allow Engine.IO v3 clients
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Get user info from auth handshake
    const { userId, role } = socket.handshake.auth || {};

    // Store admin sockets automatically based on role
    if (role === "admin" && userId) {
      adminSockets.set(userId, socket.id);
      console.log(`Admin connected: ${userId} with socket ${socket.id}`);
    }

    // Admins identify themselves after connecting (backup method)
    socket.on("admin-connect", (adminId) => {
      adminSockets.set(adminId, socket.id);
      console.log(`Admin manually connected: ${adminId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Clean up disconnected admins
      for (let [id, socketId] of adminSockets) {
        if (socketId === socket.id) {
          adminSockets.delete(id);
          console.log(`Admin disconnected: ${id}`);
          break;
        }
      }
    });
  });

  return { io, adminSockets };
};

export const getAdminSockets = () => adminSockets;
