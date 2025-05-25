import { Server } from 'socket.io';

// Store admin sockets for real-time notifications
const adminSockets = new Map();

export const configureSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Admins identify themselves after connecting
    socket.on('admin-connect', (adminId) => {
      adminSockets.set(adminId, socket);
      console.log(`Admin connected: ${adminId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Clean up disconnected admins
      for (let [id, sock] of adminSockets) {
        if (sock === socket) {
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