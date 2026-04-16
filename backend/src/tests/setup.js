import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';

let mongoServer;

beforeAll(async () => {
    // Silence console output globally to prevent clutter from expected test errors
    console.log = () => {};
    console.error = () => {};
    console.warn = () => {};
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect Mongoose to the Memory Server
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(mongoUri);

    // Mock Redis to prevent connection errors during tests
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      process.env.UPSTASH_REDIS_REST_URL = 'https://mock.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'mock-token';
    }

    // Replace Upstash Redis fetch logic globally to prevent errors
    global.fetch = jest.fn((url) => {
        if (url.toString().includes('mock.upstash.io')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ result: 'mock' })
            });
        }
        return Promise.reject(new Error('Unmocked fetch to: ' + url));
    });
});

afterAll(async () => {
    // Disconnect and stop Memory Server
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
    jest.restoreAllMocks();
});

afterEach(async () => {
    // Clear all collections after each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
});
