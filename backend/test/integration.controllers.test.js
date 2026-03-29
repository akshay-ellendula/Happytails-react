import test from "node:test";
import assert from "node:assert/strict";

import Customer from "../src/models/customerModel.js";
import EventManager from "../src/models/eventManagerModel.js";
import {
  createAuthCookie,
  jsonRequest,
  registerIntegrationHarness,
} from "../test-support/integrationHarness.js";
import {
  createCustomerFixture,
  createEventFixture,
  createEventManagerFixture,
  createTicketFixtures,
} from "../test-support/fixtures.js";

const harness = registerIntegrationHarness();

test("customer routes return sanitized customers and persist profile updates", async () => {
  const customer = await createCustomerFixture();
  await createCustomerFixture({
    userName: "Alex Customer",
    email: "alex.customer@gmail.com",
  });

  const adminCookie = createAuthCookie({
    adminId: "admin_root_001",
    role: "admin",
  });

  const listResult = await jsonRequest(harness, "/api/public", {
    cookie: adminCookie,
  });

  assert.equal(listResult.response.status, 200);
  assert.equal(listResult.body.length, 2);
  assert.equal(Object.hasOwn(listResult.body[0], "password"), false);

  const customerCookie = createAuthCookie({
    customerId: customer._id.toString(),
    role: "customer",
  });

  const updateResult = await jsonRequest(harness, `/api/public/${customer._id}`, {
    method: "PUT",
    cookie: customerCookie,
    body: {
      userName: "Jane Updated",
      email: "jane.updated@gmail.com",
      phoneNumber: "9998887776",
      addresses: [
        {
          name: "Work",
          houseNumber: "42B",
          streetNo: "Mount Road",
          city: "Chennai",
          pincode: "600002",
        },
        {
          name: "Parents",
          houseNumber: "18",
          streetNo: "Temple Street",
          city: "Madurai",
          pincode: "625001",
        },
      ],
    },
  });

  assert.equal(updateResult.response.status, 200);
  assert.equal(updateResult.body.success, true);
  assert.equal(updateResult.body.user.userName, "Jane Updated");
  assert.equal(updateResult.body.user.addresses[0].name, "Work");
  assert.equal(updateResult.body.user.addresses[0].isDefault, true);

  const persistedCustomer = await Customer.findById(customer._id).lean();
  assert.equal(persistedCustomer.userName, "Jane Updated");
  assert.equal(persistedCustomer.email, "jane.updated@gmail.com");
  assert.equal(persistedCustomer.addresses[0].isDefault, true);
  assert.equal(persistedCustomer.addresses[1].isDefault, false);
});

test("customer routes block cross-account updates", async () => {
  const targetCustomer = await createCustomerFixture({
    email: "target.customer@gmail.com",
  });
  const actorCustomer = await createCustomerFixture({
    email: "actor.customer@gmail.com",
  });

  const actorCookie = createAuthCookie({
    customerId: actorCustomer._id.toString(),
    role: "customer",
  });

  const result = await jsonRequest(harness, `/api/public/${targetCustomer._id}`, {
    method: "PUT",
    cookie: actorCookie,
    body: {
      userName: "Blocked Update",
      email: "blocked.update@gmail.com",
    },
  });

  assert.equal(result.response.status, 403);
  assert.equal(result.body.success, false);
  assert.match(result.body.message, /only edit your own profile/i);
});

test("event manager routes return the current profile and update the password", async () => {
  const eventManager = await createEventManagerFixture({
    email: "manager.profile@gmail.com",
  });
  const managerCookie = createAuthCookie({
    eventManagerId: eventManager._id.toString(),
    role: "eventManager",
  });

  const profileResult = await jsonRequest(harness, "/api/eventManagers/profile/me", {
    cookie: managerCookie,
  });

  assert.equal(profileResult.response.status, 200);
  assert.equal(profileResult.body.userName, eventManager.userName);
  assert.equal(Object.hasOwn(profileResult.body, "password"), false);

  const passwordResult = await jsonRequest(harness, "/api/eventManagers/change-password", {
    method: "PUT",
    cookie: managerCookie,
    body: {
      currentPassword: "Secret123",
      newPassword: "NewSecret456",
    },
  });

  assert.equal(passwordResult.response.status, 200);
  assert.equal(passwordResult.body.success, true);

  const updatedManager = await EventManager.findById(eventManager._id);
  assert.equal(await updatedManager.matchPassword("NewSecret456"), true);
});

test("event analytics endpoints aggregate only the signed-in manager's data", async () => {
  const manager = await createEventManagerFixture({
    email: "analytics.manager@gmail.com",
  });
  const otherManager = await createEventManagerFixture({
    email: "other.analytics.manager@gmail.com",
  });
  const customer = await createCustomerFixture({
    email: "analytics.customer@gmail.com",
  });

  const mainEvent = await createEventFixture(manager._id, {
    title: "Adoption Fair",
    total_tickets: 50,
  });
  const secondEvent = await createEventFixture(manager._id, {
    title: "Pet Wellness Talk",
    total_tickets: 100,
    ticketPrice: 150,
  });
  const ignoredEvent = await createEventFixture(otherManager._id, {
    title: "Ignore Me",
    total_tickets: 25,
  });

  await createTicketFixtures([
    {
      eventId: mainEvent._id,
      customerId: customer._id,
      numberOfTickets: 3,
      price: 600,
      createdAt: new Date("2026-03-10T10:00:00.000Z"),
    },
    {
      eventId: secondEvent._id,
      customerId: customer._id,
      numberOfTickets: 1,
      price: 150,
      createdAt: new Date("2026-03-14T12:00:00.000Z"),
    },
    {
      eventId: mainEvent._id,
      customerId: customer._id,
      numberOfTickets: 1,
      price: 200,
      createdAt: new Date("2026-02-10T09:00:00.000Z"),
    },
    {
      eventId: ignoredEvent._id,
      customerId: customer._id,
      numberOfTickets: 5,
      price: 1000,
      createdAt: new Date("2026-03-12T10:00:00.000Z"),
    },
  ]);

  const managerCookie = createAuthCookie({
    eventManagerId: manager._id.toString(),
    role: "eventManager",
  });

  const dashboardResult = await jsonRequest(
    harness,
    "/api/eventAnalytics/dashboard?startDate=2026-03-01&endDate=2026-03-31",
    {
      cookie: managerCookie,
    },
  );

  assert.equal(dashboardResult.response.status, 200);
  assert.deepEqual(dashboardResult.body.basicStats, {
    totalEvents: 2,
    totalTicketsSold: 4,
    totalRevenue: 750,
    platformFee: 45,
    netRevenue: 705,
    revenueGrowth: 275,
    totalAttendees: 4,
  });

  const attendanceResult = await jsonRequest(
    harness,
    "/api/eventAnalytics/attendance?startDate=2026-03-01&endDate=2026-03-31",
    {
      cookie: managerCookie,
    },
  );

  assert.equal(attendanceResult.response.status, 200);
  assert.equal(attendanceResult.body.length, 2);
  assert.equal(attendanceResult.body[0].name, "Adoption Fair");
  assert.equal(attendanceResult.body[0].sold, 3);
  assert.equal(attendanceResult.body[0].rate, 6);
  assert.equal(attendanceResult.body[1].name, "Pet Wellness Talk");
  assert.equal(attendanceResult.body[1].sold, 1);
  assert.equal(attendanceResult.body[1].rate, 1);
});
