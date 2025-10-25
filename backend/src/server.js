import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import connect_Db from "./config/config_db.js";

import authRoutes from "./router/authRoutes.js";
import customerRoutes from "./router/customerRoutes.js";
import eventManagerRoutes from "./router/eventManagerRoutes.js";
import eventRoutes from "./router/eventRoutes.js";
import ticketRoutes from "./router/ticketRouter.js";
import productRoutes from "./router/productRoutes.js";
import eventAnalyticsRoutes from "./router/eventAnalyticsRoutes.js";
import adminRoutes from "./router/adminRoutes.js";
import vendorRoutes from "./router/vendorRoutes.js";

const app = express();

connect_Db();

app.use(express.json());
app.use(cookieParser());

// NOTE: express-session has been removed in favor of JWT based authentication

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/public", customerRoutes);
app.use("/api/eventManagers", eventManagerRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/products", productRoutes);
app.use("/api/eventAnalytics", eventAnalyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vendors", vendorRoutes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
