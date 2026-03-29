import test from "node:test";
import assert from "node:assert/strict";

import { swaggerSpec } from "../src/app.js";

test("swagger spec exposes the expected top-level metadata", () => {
  assert.equal(swaggerSpec.openapi, "3.0.0");
  assert.equal(swaggerSpec.info.title, "HappyTails API");
  assert.ok(swaggerSpec.paths);
});

test("swagger spec includes key examples and corrected request fields", () => {
  const signinOperation = swaggerSpec.paths["/api/auth/signin"]?.post;
  assert.ok(signinOperation, "Missing /api/auth/signin POST operation");
  assert.equal(signinOperation.security?.length ?? 0, 0);
  assert.equal(
    signinOperation.responses?.["200"]?.content?.["application/json"]?.example?.user?.role,
    "customer",
  );

  const adminStatsExample =
    swaggerSpec.paths["/api/admin/stats"]?.get?.responses?.["200"]?.content?.["application/json"]?.example;
  assert.ok(adminStatsExample, "Missing /api/admin/stats GET example");
  assert.equal(adminStatsExample.success, true);
  assert.ok(adminStatsExample.stats.totalUsers >= 0);
  assert.ok(adminStatsExample.stats.totalRevenue >= 0);

  const vendorDashboardExample =
    swaggerSpec.paths["/api/vendors/dashboard"]?.get?.responses?.["200"]?.content?.["application/json"]?.example;
  assert.ok(vendorDashboardExample, "Missing /api/vendors/dashboard GET example");
  assert.equal(vendorDashboardExample.success, true);
  assert.ok(vendorDashboardExample.stats.insights);
  assert.ok(vendorDashboardExample.stats.totalRevenue);
  assert.ok(vendorDashboardExample.stats.topProducts);

  const ticketRequestSchema =
    swaggerSpec.paths["/api/tickets/{id}"]?.post?.requestBody?.content?.["application/json"]?.schema;
  assert.ok(ticketRequestSchema, "Missing /api/tickets/{id} POST request schema");
  assert.deepEqual(ticketRequestSchema.required, ["numberOfTickets", "name", "phone", "email", "paymentIntentId"]);
  assert.deepEqual(Object.keys(ticketRequestSchema.properties), [
    "numberOfTickets",
    "name",
    "phone",
    "email",
    "petName",
    "petBreed",
    "petAge",
    "paymentIntentId",
  ]);

  const ticketPaymentIntentOperation = swaggerSpec.paths["/api/tickets/create-payment-intent/{id}"]?.post;
  assert.ok(ticketPaymentIntentOperation, "Missing /api/tickets/create-payment-intent/{id} POST operation");

  const customerUpdateExample =
    swaggerSpec.paths["/api/public/{id}"]?.put?.responses?.["200"]?.content?.["application/json"]?.example;
  assert.ok(customerUpdateExample, "Missing /api/public/{id} PUT example");
  assert.equal(customerUpdateExample.user.role, "customer");
  assert.ok(customerUpdateExample.user.addresses?.length > 0);

  const eventManagerProfileExample =
    swaggerSpec.paths["/api/eventManagers/profile/me"]?.get?.responses?.["200"]?.content?.["application/json"]?.example;
  assert.ok(eventManagerProfileExample, "Missing /api/eventManagers/profile/me GET example");
  assert.equal(eventManagerProfileExample.userName, "Veda");
  assert.equal(Object.hasOwn(eventManagerProfileExample, "password"), false);

  const analyticsDashboardExample =
    swaggerSpec.paths["/api/eventAnalytics/dashboard"]?.get?.responses?.["200"]?.content?.["application/json"]?.example;
  assert.ok(analyticsDashboardExample, "Missing /api/eventAnalytics/dashboard GET example");
  assert.ok(analyticsDashboardExample.basicStats.totalEvents >= 0);
  assert.ok(analyticsDashboardExample.basicStats.netRevenue >= 0);
});

test("swagger spec does not contain stale vendor routes and preserves public route security", () => {
  for (const routePath of Object.keys(swaggerSpec.paths)) {
    assert.ok(!routePath.startsWith("/api/vendor/"), `Found stale vendor path: ${routePath}`);
  }

  assert.deepEqual(swaggerSpec.paths["/api/auth/signin"]?.post?.security, []);
  assert.deepEqual(swaggerSpec.paths["/api/events/public"]?.get?.security, []);
  assert.deepEqual(swaggerSpec.paths["/api/products/getProducts"]?.get?.security, []);
});
