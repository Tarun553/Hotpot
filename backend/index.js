import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import shopRouter from "./routes/shop.route.js";
import UserRouter from "./routes/user.route.js";
import itemRouter from "./routes/item.route.js";
import cookieParser from "cookie-parser";
import cartRouter from "./routes/cart.route.js";
import orderRouter from "./routes/order.route.js";
const app = express();

connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
// middlewares
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", UserRouter);
app.use("/api/shop", shopRouter);
app.use("/api/items", itemRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
// health check route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
