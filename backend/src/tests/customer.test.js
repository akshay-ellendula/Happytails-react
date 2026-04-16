import request from 'supertest';
import { createApp } from '../app.js';
import { jest } from '@jest/globals';
import Customer from '../models/customerModel.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import path from 'path';

beforeAll(() => {
    process.env.JWT_SECRET_KEY = 'test-secret';
    process.env.NODE_ENV = 'test';
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('Customer (User) APIs', () => {
    let app;
    let customerToken;
    let adminToken;
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

        const aToken = jwt.sign({ adminId: 'admin_root_001', role: 'admin' }, process.env.JWT_SECRET_KEY);
        adminToken = `jwt=${aToken}`;
    });

    describe('GET /api/public', () => {
        it('should get customers list when authed', async () => {
            const res = await request(app).get('/api/public').set('Cookie', adminToken);
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should handle DB errors on getCustomers', async () => {
            jest.spyOn(Customer, 'find').mockImplementation(() => { throw new Error('DB Error'); });
            const res = await request(app).get('/api/public').set('Cookie', adminToken);
            expect(res.status).toBe(500);
        });
    });

    describe('GET /api/public/:id', () => {
        it('should return 404 for nonexistent customer', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const res = await request(app).get(`/api/public/${fakeId}`).set('Cookie', customerToken);
            expect(res.status).toBe(404);
        });

        it('should handle DB errors on getCustomer', async () => {
            jest.spyOn(Customer, 'findById').mockImplementation(() => { throw new Error('DB Error'); });
            const res = await request(app).get(`/api/public/${customerId}`).set('Cookie', customerToken);
            expect(res.status).toBe(500);
        });
    });

    describe('PUT /api/public/:id (putCustomer)', () => {
        it('should forbid editing other customer profiles', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const res = await request(app).put(`/api/public/${fakeId}`).set('Cookie', customerToken).send({});
            expect(res.status).toBe(403);
            expect(res.body.message).toMatch(/Forbidden/);
        });

        it('should trigger 404 if self profile somehow deleted from under them', async () => {
            await Customer.findByIdAndDelete(customerId);
            const res = await request(app).put(`/api/public/${customerId}`).set('Cookie', customerToken)
                .send({ userName: 'A', email: 'a@gmail.com' });
            expect(res.status).toBe(404);
        });

        it('should trigger 400 for missing username/email', async () => {
            const res = await request(app).put(`/api/public/${customerId}`).set('Cookie', customerToken).send({});
            expect(res.status).toBe(400);
        });

        it('should reject invalid email format', async () => {
            const res = await request(app).put(`/api/public/${customerId}`).set('Cookie', customerToken).send({ userName: 'A', email: 'fail.com' });
            expect(res.status).toBe(400);
        });

        it('should reject already taken email', async () => {
            const other = await Customer.create({ userName: 'Other', email: 'other@gmail.com', password: 'abc' });
            const res = await request(app).put(`/api/public/${customerId}`).set('Cookie', customerToken)
                .send({ userName: 'A', email: 'other@gmail.com' });
            expect(res.status).toBe(400);
        });

        it('should parse valid addresses and update normally', async () => {
            const addrs = [{ houseNumber: "1", streetNo: "A", city: "C", pincode: "123", isDefault: false }];
            const res = await request(app).put(`/api/public/${customerId}`).set('Cookie', customerToken)
                .send({ userName: 'A', email: 'new@gmail.com', addresses: JSON.stringify(addrs) });
            expect(res.status).toBe(200);
            expect(res.body.user.addresses[0].isDefault).toBe(true); // default enforced
        });

        it('should handle DB errors in putCustomer', async () => {
            jest.spyOn(Customer, 'findById').mockRejectedValue(new Error('DB crash'));
            const res = await request(app).put(`/api/public/${customerId}`).set('Cookie', customerToken).send({ userName: 'A', email: 'new@gmail.com' });
            expect(res.status).toBe(500);
        });

        it('should catch invalid addresses JSON parse format', async () => {
            const res = await request(app).put(`/api/public/${customerId}`).set('Cookie', customerToken).send({ userName: 'A', email: 'a@gmail.com', addresses: '{invalid' });
            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /api/public/:id', () => {
        it('should delete customer correctly when admin', async () => {
            const res = await request(app).delete(`/api/public/${customerId}`).set('Cookie', adminToken);
            expect(res.status).toBe(200);
        });

        it('should return 404 for deleting invalid customer', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const res = await request(app).delete(`/api/public/${fakeId}`).set('Cookie', adminToken);
            expect(res.status).toBe(404);
        });

        it('should catch DB error on deleteCustomer', async () => {
            jest.spyOn(Customer, 'findById').mockRejectedValue(new Error('DB failure'));
            const res = await request(app).delete(`/api/public/${customerId}`).set('Cookie', adminToken);
            expect(res.status).toBe(500);
        });
    });

    describe('PUT /api/public/changeStatus/:id', () => {
        it('should toggle customer status when admin', async () => {
            const res = await request(app).put(`/api/public/changeStatus/${customerId}`).set('Cookie', adminToken);
            expect(res.status).toBe(200);
            
            const changed = await Customer.findById(customerId);
            expect(changed.isActive).toBe(false);
        });

        it('should return 404 for invalid customer status toggle', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const res = await request(app).put(`/api/public/changeStatus/${fakeId}`).set('Cookie', adminToken);
            expect(res.status).toBe(404);
        });

        it('should catch DB errors on changeStatus', async () => {
            jest.spyOn(Customer, 'findById').mockRejectedValue(new Error('Crash'));
            const res = await request(app).put(`/api/public/changeStatus/${customerId}`).set('Cookie', adminToken);
            expect(res.status).toBe(500);
        });
    });
});
