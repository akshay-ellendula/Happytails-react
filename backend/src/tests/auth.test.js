import request from 'supertest';
import { createApp } from '../app.js';
import { jest } from '@jest/globals';
import Customer from '../models/customerModel.js';
import EventManager from '../models/eventManagerModel.js';
import Vendor from '../models/vendorModel.js';
import Admin from '../models/adminModel.js';
import * as sendEmailModule from '../utils/sendEmail.js';

// Set up required environment variables for testing
beforeAll(() => {
    process.env.JWT_SECRET_KEY = 'test-secret';
    process.env.NODE_ENV = 'test';
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('Authentication API', () => {
    let app;

    beforeAll(() => {
        app = createApp({ enableLogging: false, initializePassport: false });
    });

    describe('Customer Auth (POST /api/auth/signup & /signin)', () => {
        it('should successfully register a customer and login', async () => {
            const res = await request(app).post('/api/auth/signup').send({ userName: 'Cust', email: 'cust@gmail.com', password: 'password123' });
            expect(res.status).toBe(201);
            
            const loginRes = await request(app).post('/api/auth/signin').send({ email: 'cust@gmail.com', password: 'password123' });
            expect(loginRes.status).toBe(200);
            expect(loginRes.headers['set-cookie']).toBeDefined();
        });

        it('should handle DB failure gracefully on signin', async () => {
            jest.spyOn(Customer, 'findOne').mockRejectedValue(new Error('DB Error Simulator'));
            const res = await request(app).post('/api/auth/signin').send({ email: 'fail@gmail.com', password: 'pass' });
            expect(res.status).toBe(500);
        });
    });

    describe('EventManager Auth', () => {
        it('should reject missing fields on eventManagerSignup', async () => {
            const res = await request(app).post('/api/auth/eventManagerSignup').send({});
            expect(res.status).toBe(400);
        });

        it('should successfully register an EventManager, login, and handle DB errors', async () => {
            const payload = { userName: 'EM', email: 'em@gmail.com', password: 'password123', contactnumber: '1234567890', companyname: 'Happy', location: 'City' };
            const res = await request(app).post('/api/auth/eventManagerSignup').send(payload);
            expect(res.status).toBe(201);

            const loginRes = await request(app).post('/api/auth/eventManagerSignin').send({ email: 'em@gmail.com', password: 'password123' });
            expect(loginRes.status).toBe(200);

            // DB mock tests
            jest.spyOn(EventManager, 'findOne').mockRejectedValue(new Error('DB Crash'));
            const resCrash = await request(app).post('/api/auth/eventManagerSignup').send(payload);
            expect(resCrash.status).toBe(500);

            const errRes = await request(app).post('/api/auth/eventManagerSignin').send({ email: 'em@gmail.com', password: 'password123' });
            expect(errRes.status).toBe(500);
        });
    });

    describe('Vendor/StorePartner Auth', () => {
        it('should reject missing fields on storeSignup', async () => {
            const res = await request(app).post('/api/auth/storeSignup').send({});
            expect(res.status).toBe(400);
        });

        it('should successfully register and login a Vendor, then catch DB errors', async () => {
            const payload = { userName: 'Vendor', email: 'v@gmail.com', password: 'password123', contactnumber: '1234567890', storename: 'Store1', storelocation: 'Loc' };
            const res = await request(app).post('/api/auth/storeSignup').send(payload);
            expect(res.status).toBe(201);

            const login = await request(app).post('/api/auth/storeSignin').send({ email: 'v@gmail.com', password: 'password123' });
            expect(login.status).toBe(200);

            jest.spyOn(Vendor, 'findOne').mockRejectedValue(new Error('DB Crash'));
            const errSign = await request(app).post('/api/auth/storeSignup').send(payload);
            expect(errSign.status).toBe(500);

            const errLogin = await request(app).post('/api/auth/storeSignin').send({ email: 'v@gmail.com', password: 'pass' });
            expect(errLogin.status).toBe(500);
        });
    });

    describe('Admin Auth', () => {
        it('should register admin and trigger DB errors', async () => {
            const payload = { userName: 'Admin', email: 'admin2@gmail.com', password: 'password123' };
            const res = await request(app).post('/api/auth/adminSignup').send(payload);
            expect(res.status).toBe(201);

            jest.spyOn(Admin, 'findOne').mockRejectedValue(new Error('DB failure'));
            const resFail = await request(app).post('/api/auth/adminSignup').send(payload);
            expect(resFail.status).toBe(500);
        });

        it('should login hardcoded admin', async () => {
            const res = await request(app).post('/api/auth/adminSignin').send({ email: 'admin@gmail.com', password: 'admin123#' });
            expect(res.status).toBe(200);
        });
    });

    describe('Verify Auth & Logout', () => {
        it('should logout correctly', async () => {
            const res = await request(app).post('/api/auth/logout');
            expect(res.status).toBe(200);
        });
    });

    describe('Forgot & Reset Password Edge Cases', () => {
        it('should handle forgotten password DB crashes', async () => {
            jest.spyOn(Customer, 'findOne').mockRejectedValue(new Error('DB Down'));
            const res = await request(app).post('/api/auth/forgotpassword').send({ email: 'cust@gmail.com', role: 'customer' });
            expect(res.status).toBe(500);
        });
    });
});
