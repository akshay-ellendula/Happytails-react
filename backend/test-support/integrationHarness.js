import { after, before, beforeEach } from "node:test";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET_KEY ??= "integration-test-secret";
process.env.FRONTEND_URL ??= "http://localhost:5173";
process.env.BACKEND_URL ??= "http://localhost:5001";
process.env.GOOGLE_CLIENT_ID ??= "test-google-client";
process.env.GOOGLE_CLIENT_SECRET ??= "test-google-secret";
process.env.GOOGLE_CALLBACK_URL ??= "http://localhost:5001/api/auth/google/callback";
process.env.CLOUDINARY_CLOUD_NAME ??= "test-cloud";
process.env.CLOUDINARY_API_KEY ??= "test-key";
process.env.CLOUDINARY_API_SECRET ??= "test-secret";
process.env.EMAIL_USERNAME ??= "test@example.com";
process.env.EMAIL_PASSWORD ??= "test-password";

const { createApp } = await import("../src/app.js");

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    if (!server || !server.listening) {
      resolve();
      return;
    }

    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export function registerIntegrationHarness() {
  const context = {
    baseUrl: "",
    mongoServer: null,
    server: null,
  };

  before(async () => {
    context.mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(context.mongoServer.getUri(), {
      dbName: "happytails-integration-tests",
    });

    const app = createApp({ enableLogging: false, initializePassport: false });
    context.server = app.listen(0);
    await listen(context.server);

    const address = context.server.address();
    context.baseUrl = `http://127.0.0.1:${address.port}`;
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  after(async () => {
    await close(context.server);
    await mongoose.disconnect();

    if (context.mongoServer) {
      await context.mongoServer.stop();
    }
  });

  return context;
}

export function createAuthCookie(payload, options = {}) {
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: options.expiresIn ?? "30m",
  });

  return `jwt=${token}`;
}

export async function jsonRequest(
  context,
  routePath,
  { body, cookie, headers = {}, method = "GET" } = {},
) {
  const requestHeaders = {
    ...headers,
  };

  let requestBody;
  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  if (cookie) {
    requestHeaders.Cookie = cookie;
  }

  const response = await fetch(`${context.baseUrl}${routePath}`, {
    method,
    headers: requestHeaders,
    body: requestBody,
  });

  const text = await response.text();
  let json = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }

  return {
    body: json,
    response,
    text,
  };
}
