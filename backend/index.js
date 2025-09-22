import express from "express";
import { createServer } from 'http';
import { initializeSocket } from "./socket/socket.js";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import shopRouter from "./routes/shop.route.js";
import UserRouter from "./routes/user.route.js";
import itemRouter from "./routes/item.route.js";
import cookieParser from "cookie-parser";
import cartRouter from "./routes/cart.route.js";
import orderRouter from "./routes/order.route.js";
import deliveryRouter from "./routes/delivery.route.js";
import User from "./models/user.model.js";


const app = express();
const httpServer = createServer(app);
export const io = initializeSocket(httpServer);

// Connect to database and ensure indexes
const initializeServer = async () => {
  try {
    await connectDB();
    
    // Ensure geospatial index exists for delivery boy location queries
    console.log('🔧 Ensuring geospatial index for user locations...');
    await User.collection.createIndex({ "location": "2dsphere" });
    console.log('✅ Geospatial index ensured for user locations');
    
  } catch (error) {
    console.error('❌ Server initialization error:', error);
  }
};

initializeServer();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://hotpot-frontend.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
// middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/user", UserRouter);
app.use("/api/shop", shopRouter);
app.use("/api/items", itemRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/delivery", deliveryRouter);
// health check route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});
