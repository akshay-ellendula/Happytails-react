import Customer from "../src/models/customerModel.js";
import Event from "../src/models/eventModel.js";
import EventManager from "../src/models/eventManagerModel.js";
import Ticket from "../src/models/ticketModel.js";

let sequence = 1;

function nextId(prefix) {
  const value = `${prefix}-${sequence}`;
  sequence += 1;
  return value;
}

export async function createCustomerFixture(overrides = {}) {
  const suffix = nextId("customer");

  return Customer.create({
    userName: "Jane Customer",
    email: `${suffix}@gmail.com`,
    password: "Secret123",
    profilePic: "https://example.com/customer.png",
    phoneNumber: "9876543210",
    addresses: [
      {
        name: "Home",
        houseNumber: "10A",
        streetNo: "Lake View Road",
        city: "Chennai",
        pincode: "600001",
        isDefault: true,
      },
    ],
    ...overrides,
  });
}

export async function createEventManagerFixture(overrides = {}) {
  const suffix = nextId("manager");

  return EventManager.create({
    userName: "Veda Manager",
    email: `${suffix}@gmail.com`,
    password: "Secret123",
    profilePic: "https://example.com/manager.png",
    companyName: "HappyTails Events",
    phoneNumber: "9876543210",
    ...overrides,
  });
}

export async function createEventFixture(eventManagerId, overrides = {}) {
  const suffix = nextId("event");

  return Event.create({
    eventManagerId,
    title: `Pet Adoption Camp ${suffix}`,
    description: "Community pet event",
    language: "English",
    duration: "3h",
    ageLimit: "All",
    ticketPrice: 200,
    date_time: new Date("2026-04-15T18:00:00.000Z"),
    images: {
      thumbnail: "https://example.com/event-thumb.jpg",
      banner: "https://example.com/event-banner.jpg",
    },
    category: "Pets",
    venue: "City Hall",
    location: "Chennai",
    total_tickets: 100,
    tickets_sold: 0,
    ...overrides,
  });
}

export async function createTicketFixtures(ticketInputs) {
  const documents = ticketInputs.map((ticketInput, index) => ({
    ticketId: `TKT-${Date.now()}-${sequence + index}`,
    status: true,
    numberOfTickets: 1,
    price: 200,
    contactName: "Jane Customer",
    contactPhone: "9876543210",
    contactEmail: "jane.customer@gmail.com",
    createdAt: ticketInput.createdAt ?? new Date(),
    purchaseDate: ticketInput.createdAt ?? new Date(),
    updatedAt: ticketInput.createdAt ?? new Date(),
    ...ticketInput,
  }));

  sequence += ticketInputs.length;

  return Ticket.insertMany(documents);
}
