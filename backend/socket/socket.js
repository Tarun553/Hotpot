import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "https://hotpot-frontend.onrender.com"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        console.log("Socket connection attempted without token");
        return next(new Error('No token provided'));
      }
      
      console.log("Authenticating socket connection with token");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        console.log("User not found for token");
        return next(new Error('User not found'));
      }
      
      socket.userId = user._id;
      socket.userRole = user.role;
      socket.userEmail = user.email;
      console.log(`Socket authenticated for user: ${user.email}`);
      next();
    } catch (err) {
      console.error("Socket authentication failed:", err.message);
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