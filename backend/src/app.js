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
import ratingRoutes from './router/ratingRoutes.js';
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

  app.get("/api", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>HappyTails API</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700&display=swap');
          * { box-sizing: border-box; }
          body {
            font-family: 'Outfit', sans-serif;
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%);
            overflow: hidden;
            position: relative;
          }
          .blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            z-index: 0;
            opacity: 0.6;
            animation: float 10s infinite ease-in-out alternate;
          }
          .blob1 { width: 400px; height: 400px; background: #fb7185; top: -100px; left: -100px; animation-delay: 0s; }
          .blob2 { width: 300px; height: 300px; background: #c084fc; bottom: -50px; right: -50px; animation-delay: -5s; }
          @keyframes float {
            0% { transform: translateY(0) scale(1); }
            100% { transform: translateY(-50px) scale(1.1); }
          }
          .container {
            position: relative;
            z-index: 1;
            text-align: center;
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            padding: 4rem 5rem;
            border-radius: 24px;
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15), inset 0 0 0 1px rgba(255,255,255,0.4);
            animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          h1 { color: #881337; margin: 0 0 0.5rem 0; font-size: 3.5rem; font-weight: 700; letter-spacing: -1px; }
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255,255,255,0.6);
            padding: 6px 16px;
            border-radius: 50px;
            font-weight: 500;
            color: #10b981;
            font-size: 0.9rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }
          .status-dot { width: 10px; height: 10px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; }
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
          p { color: #4c1d95; font-size: 1.2rem; font-weight: 300; margin-bottom: 2.5rem; line-height: 1.6; max-width: 350px; margin-left: auto; margin-right: auto; }
          a.button {
            background: linear-gradient(135deg, #e11d48 0%, #be185d 100%);
            color: white;
            padding: 16px 36px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 1.1rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: inline-block;
            box-shadow: 0 10px 20px rgba(225, 29, 72, 0.3), inset 0 1px 0 rgba(255,255,255,0.2);
          }
          a.button:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 15px 25px rgba(225, 29, 72, 0.4), inset 0 1px 0 rgba(255,255,255,0.2); }
        </style>
      </head>
      <body>
        <div class="blob blob1"></div>
        <div class="blob blob2"></div>
        <div class="container">
          <h1>🐾 HappyTails</h1>
          <div class="status-badge">
            <div class="status-dot"></div>
            API Online
          </div>
          <p>Welcome to the core backend services! Everything is running smoothly.</p>
          <a href="/api-docs" class="button">Explore Documentation</a>
        </div>
      </body>
      </html>
    `);
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/public", customerRoutes);
  app.use("/api/eventManagers", eventManagerRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/eventAnalytics", eventAnalyticsRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/vendors", vendorRoutes);
  app.use('/api/ratings', ratingRoutes);
  app.use("/api/review", reviewRoutes);

  app.use(errorHandler);

  return app;
}
