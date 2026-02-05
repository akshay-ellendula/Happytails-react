import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import helmet from "helmet";         

import connect_Db from "./config/config_db.js";

// Routes
import authRoutes from "./router/authRoutes.js";
import customerRoutes from "./router/customerRoutes.js";
import eventManagerRoutes from "./router/eventManagerRoutes.js";
import eventRoutes from "./router/eventRoutes.js";
import ticketRoutes from "./router/ticketRouter.js";
import productRoutes from "./router/productRoutes.js";
import eventAnalyticsRoutes from "./router/eventAnalyticsRoutes.js";
import adminRoutes from "./router/adminRoutes.js";
import vendorRoutes from "./router/vendorRoutes.js";

// Import Error Middleware
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

connect_Db();


// 1. ACCESS LOGGING SETUP (Morgan)

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Rotate access logs daily
const accessLogStream = createStream("access.log", {
  interval: "1d",
  path: logDir,
  compress: "gzip"
});

// Log every request
app.use(
  morgan(":method :url :status :response-time ms", {
    stream: accessLogStream
  })
);

// 2. SECURITY HEADERS (helmet)
app.use(helmet());

// 3. Body parsing + cookies
app.use(express.json());
app.use(cookieParser());

// 4. CORS

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// 5. Routes
app.use("/api/auth", authRoutes);
app.use("/api/public", customerRoutes);
app.use("/api/eventManagers", eventManagerRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/products", productRoutes);
app.use("/api/eventAnalytics", eventAnalyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vendors", vendorRoutes);

// 6. Error handling (must be last middleware)
app.use(errorHandler);

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});