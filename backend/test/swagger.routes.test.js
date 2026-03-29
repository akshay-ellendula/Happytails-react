import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { swaggerSpec } from "../src/app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routerDir = path.resolve(__dirname, "../src/router");

const mountPoints = {
  "adminRoutes.js": "/api/admin",
  "authRoutes.js": "/api/auth",
  "customerRoutes.js": "/api/public",
  "eventAnalyticsRoutes.js": "/api/eventAnalytics",
  "eventManagerRoutes.js": "/api/eventManagers",
  "eventRoutes.js": "/api/events",
  "productRoutes.js": "/api/products",
  "ticketRouter.js": "/api/tickets",
  "vendorRoutes.js": "/api/vendors",
};

const supportedMethods = ["get", "post", "put", "delete", "patch"];

function normalizeRoutePath(routePath) {
  return routePath.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, "{$1}");
}

function joinMountPath(basePath, routePath) {
  return `${basePath}${routePath === "/" ? "" : routePath}`;
}

function extractRoutes(source, fileName) {
  const basePath = mountPoints[fileName];
  const routes = [];
  const directPattern = /router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g;
  const chainPattern =
    /router\.route\(\s*['"]([^'"]+)['"]\s*\)([\s\S]*?)(?=\n\s*router\.|\n\s*export default|$)/g;

  let directMatch;
  while ((directMatch = directPattern.exec(source)) !== null) {
    routes.push({
      method: directMatch[1],
      path: normalizeRoutePath(joinMountPath(basePath, directMatch[2])),
    });
  }

  let chainedMatch;
  while ((chainedMatch = chainPattern.exec(source)) !== null) {
    const normalizedPath = normalizeRoutePath(joinMountPath(basePath, chainedMatch[1]));

    for (const method of supportedMethods) {
      const methodPattern = new RegExp(`\\.${method}\\s*\\(`, "g");
      if (methodPattern.test(chainedMatch[2])) {
        routes.push({ method, path: normalizedPath });
      }
    }
  }

  return routes;
}

test("every mounted express route is documented in swagger", () => {
  const undocumented = [];

  for (const fileName of fs.readdirSync(routerDir)) {
    if (!mountPoints[fileName]) {
      continue;
    }

    const source = fs.readFileSync(path.join(routerDir, fileName), "utf8");
    const routes = extractRoutes(source, fileName);

    for (const route of routes) {
      if (!swaggerSpec.paths[route.path]?.[route.method]) {
        undocumented.push(`${route.method.toUpperCase()} ${route.path} (${fileName})`);
      }
    }
  }

  assert.deepEqual(undocumented, []);
});
