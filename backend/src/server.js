import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import helmet from "helmet";         
import swaggerJsdoc from "swagger-jsdoc"; // Add this
import swaggerUi from "swagger-ui-express"; // Add this
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

import passport from 'passport';
import { configureGoogleStrategy } from './config/passport.js';

// Import Error Middleware
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();
configureGoogleStrategy();
app.use(passport.initialize());
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
// --- SWAGGER SETUP ---
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HappyTails API",
      version: "1.0.0",
      description: "API documentation for the HappyTails Backend",
    },
    servers: [
      {
        url: "http://localhost:5001",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Tell swagger-jsdoc where to look for your schemas and endpoint documentation
  apis: ["./doc/*.js" ], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
// Serve the Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
  console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
});