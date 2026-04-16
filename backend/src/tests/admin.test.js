import request from 'supertest';
import { createApp } from '../app.js';
import { jest } from '@jest/globals';
import Customer from '../models/customerModel.js';
import Vendor from '../models/vendorModel.js';
import Event from '../models/eventModel.js';
import Ticket from '../models/ticketModel.js';
import { Product } from '../models/productsModel.js';
import { OrderItem } from '../models/orderModel.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

beforeAll(() => {
    process.env.JWT_SECRET_KEY = 'test-secret';
    process.env.NODE_ENV = 'test';
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('Admin APIs', () => {
    let app;
    let adminToken;

    beforeAll(() => {
        app = createApp({ enableLogging: false, initializePassport: false });
        const aToken = jwt.sign({ adminId: 'admin_root_001', role: 'admin' }, process.env.JWT_SECRET_KEY);
        adminToken = `jwt=${aToken}`;
    });

    describe('Admin Protected Routes: Customers', () => {
        it('should get customers empty list when authenticated as admin', async () => {
            const res = await request(app).get('/api/admin/customers').set('Cookie', adminToken);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should catch DB error for getting customers', async () => {
            jest.spyOn(Customer, 'find').mockImplementation(() => { throw new Error('Crash'); });
            const res = await request(app).get('/api/admin/customers').set('Cookie', adminToken);
            expect(res.status).toBe(500);
        });
    });

    describe('Admin Protected Routes: Vendors', () => {
        it('should get top vendors', async () => {
            const res = await request(app).get('/api/admin/vendors/top-vendors').set('Cookie', adminToken);
            expect(res.status).toBe(200);
        });

        it('should catch DB errors for top vendors', async () => {
            jest.spyOn(OrderItem, 'aggregate').mockImplementation(() => { throw new Error('Crash'); });
            const res = await request(app).get('/api/admin/vendors/top-vendors').set('Cookie', adminToken);
            expect(res.status).toBe(500);
        });

        it('should get vendors with revenue', async () => {
            const res = await request(app).get('/api/admin/vendors/with-revenue').set('Cookie', adminToken);
            expect(res.status).toBe(200);
        });
    });

    describe('Admin Protected Routes: Events', () => {
        it('should get top events', async () => {
            const res = await request(app).get('/api/admin/events/top-events').set('Cookie', adminToken);
            expect(res.status).toBe(200);
        });

        it('should catch DB errors for top events', async () => {
            jest.spyOn(Ticket, 'aggregate').mockImplementation(() => { throw new Error('Crash'); });
            const res = await request(app).get('/api/admin/events/top-events').set('Cookie', adminToken);
            expect(res.status).toBe(500);
        });
    });

    describe('Admin Protected Routes: Products', () => {
        it('should get products', async () => {
            const res = await request(app).get('/api/admin/products').set('Cookie', adminToken);
            expect(res.status).toBe(200);
        });

        it('should catch DB error on products', async () => {
            jest.spyOn(Product, 'aggregate').mockImplementation(() => { throw new Error('Crash'); });
            const res = await request(app).get('/api/admin/products').set('Cookie', adminToken);
            expect(res.status).toBe(500);
        });
    });

    describe('Admin Protected Routes: Stats & Dashboard', () => {
        it('should get dashboard stats cleanly', async () => {
            const res = await request(app).get('/api/admin/stats').set('Cookie', adminToken);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should crash safely when dashboard stats fail', async () => {
            jest.spyOn(Customer, 'countDocuments').mockImplementation(() => { throw new Error('Crash'); });
            const res = await request(app).get('/api/admin/stats').set('Cookie', adminToken);
            expect(res.status).toBe(500);
        });
    });
});
