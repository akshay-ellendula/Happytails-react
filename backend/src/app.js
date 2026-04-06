import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import helmet from "helmet";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import passport from "passport";
import { fileURLToPath } from "url";

import authRoutes from "./router/authRoutes.js";
import customerRoutes from "./router/customerRoutes.js";
import eventManagerRoutes from "./router/eventManagerRoutes.js";
import eventRoutes from "./router/eventRoutes.js";
import ticketRoutes from "./router/ticketRouter.js";
import productRoutes from "./router/productRoutes.js";
import eventAnalyticsRoutes from "./router/eventAnalyticsRoutes.js";
import adminRoutes from "./router/adminRoutes.js";
import vendorRoutes from "./router/vendorRoutes.js";
import reviewRoutes from "./router/reviewRoutes.js";
import { configureGoogleStrategy } from "./config/passport.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import "./utils/cronJobs.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const logsDir = path.join(backendRoot, "logs");
const swaggerDocsGlob = path.join(backendRoot, "doc", "*.js").replace(/\\/g, "/");

let passportConfigured = false;

function ensurePassportConfigured() {
  if (!passportConfigured) {
    configureGoogleStrategy();
    passportConfigured = true;
  }
}

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
  apis: [swaggerDocsGlob],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const swaggerUiOptions = {
  explorer: true,
  customSiteTitle: "HappyTails API Docs",
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 24px 0; }
    .swagger-ui .scheme-container {
      box-shadow: none;
      padding: 12px 0;
    }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: "list",
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 2,
    filter: true,
    tagsSorter: "alpha",
    operationsSorter: "alpha",
    tryItOutEnabled: true,
  },
};

function setupLogging(app) {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const accessLogStream = createStream("access.log", {
    interval: "1d",
    path: logsDir,
    compress: "gzip",
  });

  app.use(
    morgan(":method :url :status :response-time ms", {
      stream: accessLogStream,
    }),
  );
}

export function createApp({
  enableLogging = true,
  initializePassport = true,
} = {}) {
  const app = express();

  if (initializePassport) {
    ensurePassportConfigured();
    app.use(passport.initialize());
  }

  if (enableLogging) {
    setupLogging(app);
  }

  app.use(helmet());
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    }),
  );

  app.get("/api-docs.json", (_req, res) => {
    res.json(swaggerSpec);
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  app.use("/api/auth", authRoutes);
  app.use("/api/public", customerRoutes);
  app.use("/api/eventManagers", eventManagerRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/eventAnalytics", eventAnalyticsRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/vendors", vendorRoutes);
  app.use("/api/review", reviewRoutes);

  app.use(errorHandler);

  return app;
}
