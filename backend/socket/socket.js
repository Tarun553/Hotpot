import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      socket.userId = user._id;
      socket.userRole = user.role;
      socket.userEmail = user.email;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userEmail} (${socket.userRole})`);
    
    // Join user to their personal room
    socket.join(`user:${socket.userId}`);
    
    // Join role-specific rooms
    if (socket.userRole === 'deliveryBoy') {
      socket.join('delivery-boys');
    }
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userEmail}`);
    });
  });

  return io;
};