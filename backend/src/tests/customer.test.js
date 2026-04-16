import request from 'supertest';
import { createApp } from '../app.js';
import { jest } from '@jest/globals';
import Customer from '../models/customerModel.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

beforeAll(() => {
    process.env.JWT_SECRET_KEY = 'test-secret';
    process.env.NODE_ENV = 'test';
});

describe('Customer (User) APIs', () => {
    let app;
    let customerToken;
    let customerId;

    beforeAll(async () => {
        app = createApp({ enableLogging: false, initializePassport: false });
    });

    beforeEach(async () => {
        const customer = await Customer.create({
            userName: 'Test User',
            email: 'test_user123@gmail.com',
            password: 'password123',
            isActive: true
        });
        customerId = customer._id;

        const token = jwt.sign({ customerId: customer._id, role: 'customer' }, process.env.JWT_SECRET_KEY);
        customerToken = `jwt=${token}`;
    });

    describe('GET /api/public', () => {
        it('should block unprotected access', async () => {
            const res = await request(app).get('/api/public');
            expect(res.status).toBe(401);
        });

        it('should get customers list when authed', async () => {
            const res = await request(app)
                .get('/api/public')
                .set('Cookie', customerToken);
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/public/:id', () => {
        it('should return 404 for nonexistent customer', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const res = await request(app)
                .get(`/api/public/${fakeId}`)
                .set('Cookie', customerToken);
            expect(res.status).toBe(404);
        });

        it('should return customer details for valid id', async () => {
            const res = await request(app)
                .get(`/api/public/${customerId}`)
                .set('Cookie', customerToken);
            expect(res.status).toBe(200);
            expect(res.body.email).toBe('test_user123@gmail.com');
        });
    });
});
