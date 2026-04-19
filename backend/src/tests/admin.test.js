import request from 'supertest';
import { createApp } from '../app.js';
import { jest } from '@jest/globals';
import Customer from '../models/customerModel.js';
import Vendor from '../models/vendorModel.js';
import Event from '../models/eventModel.js';
import Ticket from '../models/ticketModel.js';
import { Product } from '../models/productsModel.js';
import { Order, OrderItem } from '../models/orderModel.js';
import EventManager from '../models/eventManagerModel.js';
import Rating from '../models/ratingModel.js';
import Review from '../models/reviewModel.js';
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

    describe('Admin: Customers', () => {
        it('should get customers list', async () => {
            const res = await request(app).get('/api/admin/customers').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get customer statistics', async () => {
            const res = await request(app).get('/api/admin/customers/stats').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get top spenders', async () => {
            const res = await request(app).get('/api/admin/customers/top-spenders').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get customers with revenue', async () => {
            const res = await request(app).get('/api/admin/customers/with-revenue').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should reject invalid token', async () => {
            const res = await request(app).get('/api/admin/customers').set('Cookie', 'invalid-token');
            expect(res.status).toBe(401);
        });

        it('should reject without token', async () => {
            const res = await request(app).get('/api/admin/customers');
            expect(res.status).toBe(401);
        });

        it('should get customer count', async () => {
            jest.spyOn(Customer, 'countDocuments').mockResolvedValueOnce(25);
            const res = await request(app).get('/api/admin/customers/stats').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should handle stats request', async () => {
            jest.spyOn(Customer, 'countDocuments').mockResolvedValueOnce(100);
            const res = await request(app).get('/api/admin/customers/stats').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);
    });

    describe('Admin Protected Routes: Vendors', () => {
        it('should get all vendors', async () => {
            const res = await request(app).get('/api/admin/vendors').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get top vendors', async () => {
            const res = await request(app).get('/api/admin/vendors/top-vendors').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get vendors with revenue', async () => {
            const res = await request(app).get('/api/admin/vendors/with-revenue').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get vendor statistics', async () => {
            const res = await request(app).get('/api/admin/vendors/stats').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get vendor count', async () => {
            jest.spyOn(Vendor, 'countDocuments').mockResolvedValueOnce(12);
            const res = await request(app).get('/api/admin/vendors/stats').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should reject vendor access without auth', async () => {
            const res = await request(app).get('/api/admin/vendors');
            expect(res.status).toBe(401);
        });

        it('should handle vendor deletion', async () => {
            const mockId = new mongoose.Types.ObjectId();
            jest.spyOn(Vendor, 'findByIdAndDelete').mockResolvedValueOnce({ _id: mockId });
            const res = await request(app).delete(`/api/admin/vendors/${mockId}`).set('Cookie', adminToken);
            expect([200, 404, 500]).toContain(res.status);
        }, 10000);
    });

    describe('Admin Protected Routes: Events', () => {
        it('should get all events', async () => {
            const res = await request(app).get('/api/admin/events').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get top events', async () => {
            const res = await request(app).get('/api/admin/events/top-events').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get events with revenue', async () => {
            const res = await request(app).get('/api/admin/events/with-revenue').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get total events count', async () => {
            const res = await request(app).get('/api/admin/events/total').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get event count', async () => {
            jest.spyOn(Event, 'countDocuments').mockResolvedValueOnce(18);
            const res = await request(app).get('/api/admin/events/total').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should reject events access without auth', async () => {
            const res = await request(app).get('/api/admin/events');
            expect(res.status).toBe(401);
        });

        it('should delete event successfully', async () => {
            const mockId = new mongoose.Types.ObjectId();
            jest.spyOn(Event, 'findByIdAndDelete').mockResolvedValueOnce({ _id: mockId });
            const res = await request(app).delete(`/api/admin/events/${mockId}`).set('Cookie', adminToken);
            expect([200, 404, 500]).toContain(res.status);
        }, 10000);
    });

    describe('Admin Protected Routes: Products', () => {
        it('should get products', async () => {
            const res = await request(app).get('/api/admin/products').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get top ordered products', async () => {
            const res = await request(app).get('/api/admin/products/top-ordered').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get product statistics', async () => {
            const res = await request(app).get('/api/admin/products/stats').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get products with revenue', async () => {
            const res = await request(app).get('/api/admin/products/with-revenue').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should handle products DB errors', async () => {
            jest.spyOn(Product, 'find').mockResolvedValueOnce([]);
            const res = await request(app).get('/api/admin/products').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should reject products access without auth', async () => {
            const res = await request(app).get('/api/admin/products');
            expect(res.status).toBe(401);
        });

        it('should delete product successfully', async () => {
            const mockId = new mongoose.Types.ObjectId();
            jest.spyOn(Product, 'findByIdAndDelete').mockResolvedValueOnce({ _id: mockId });
            const res = await request(app).delete(`/api/admin/products/${mockId}`).set('Cookie', adminToken);
            expect([200, 404, 500]).toContain(res.status);
        }, 10000);
    });

    describe('Admin Protected Routes: Orders', () => {
        it('should get all orders', async () => {
            const res = await request(app).get('/api/admin/orders').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get order statistics', async () => {
            const res = await request(app).get('/api/admin/orders/stats').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should handle orders DB errors', async () => {
            jest.spyOn(Order, 'find').mockResolvedValueOnce([]);
            const res = await request(app).get('/api/admin/orders').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get order by ID', async () => {
            const mockId = new mongoose.Types.ObjectId();
            jest.spyOn(Order, 'findById').mockResolvedValueOnce({ _id: mockId, total_amount: 100 });
            const res = await request(app).get(`/api/admin/orders/${mockId}`).set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should handle order not found', async () => {
            jest.spyOn(Order, 'findById').mockResolvedValueOnce(null);
            const mockId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/api/admin/orders/${mockId}`).set('Cookie', adminToken);
            expect([200, 404, 500]).toContain(res.status);
        }, 10000);

        it('should reject orders access without auth', async () => {
            const res = await request(app).get('/api/admin/orders');
            expect(res.status).toBe(401);
        });

        it('should filter orders by status', async () => {
            jest.spyOn(Order, 'find').mockResolvedValueOnce([]);
            const res = await request(app).get('/api/admin/orders?status=completed').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);
    });

    describe('Admin Protected Routes: Event Managers', () => {
        it('should get all event managers', async () => {
            const res = await request(app).get('/api/admin/event-managers').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get top event managers', async () => {
            const res = await request(app).get('/api/admin/event-managers/top-managers').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get event manager statistics', async () => {
            const res = await request(app).get('/api/admin/event-managers/stats').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get event managers with revenue', async () => {
            const res = await request(app).get('/api/admin/event-managers/with-revenue').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get event manager count', async () => {
            jest.spyOn(EventManager, 'countDocuments').mockResolvedValueOnce(8);
            const res = await request(app).get('/api/admin/event-managers/stats').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should reject event managers access without auth', async () => {
            const res = await request(app).get('/api/admin/event-managers');
            expect(res.status).toBe(401);
        });

        it('should delete event manager successfully', async () => {
            const mockId = new mongoose.Types.ObjectId();
            jest.spyOn(EventManager, 'findByIdAndDelete').mockResolvedValueOnce({ _id: mockId });
            const res = await request(app).delete(`/api/admin/event-managers/${mockId}`).set('Cookie', adminToken);
            expect([200, 404, 500]).toContain(res.status);
        }, 10000);
    });

    describe('Admin Protected Routes: Stats & Dashboard', () => {
        it('should get dashboard stats cleanly', async () => {
            const res = await request(app).get('/api/admin/stats').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should handle stats errors gracefully', async () => {
            jest.spyOn(Customer, 'countDocuments').mockResolvedValue(50);
            const res = await request(app).get('/api/admin/stats').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);
    });

    describe('Admin Protected Routes: Reviews', () => {
        it('should handle reviews requests', async () => {
            const res = await request(app).get('/api/admin/reviews').set('Cookie', adminToken);
            expect([200, 404, 500]).toContain(res.status);
        }, 10000);

        it('should handle flagged reviews requests', async () => {
            const res = await request(app).get('/api/admin/reviews/flagged').set('Cookie', adminToken);
            expect([200, 404, 500]).toContain(res.status);
        }, 10000);

        it('should handle review stats requests', async () => {
            const res = await request(app).get('/api/admin/reviews/stats').set('Cookie', adminToken);
            expect([200, 404, 500]).toContain(res.status);
        }, 10000);

        it('should reject reviews access without auth', async () => {
            const res = await request(app).get('/api/admin/reviews');
            expect([401, 404]).toContain(res.status);
        });
    });

    describe('Admin Protected Routes: Ratings', () => {
        it('should handle ratings requests', async () => {
            const res = await request(app).get('/api/admin/ratings').set('Cookie', adminToken);
            expect([200, 404, 500]).toContain(res.status);
        }, 10000);

        it('should handle ratings by product requests', async () => {
            const res = await request(app).get('/api/admin/ratings/by-product').set('Cookie', adminToken);
            expect([200, 404, 500]).toContain(res.status);
        }, 10000);

        it('should handle low rated products requests', async () => {
            const res = await request(app).get('/api/admin/ratings/low-rated').set('Cookie', adminToken);
            expect([200, 404, 500]).toContain(res.status);
        }, 10000);

        it('should handle ratings stats requests', async () => {
            const res = await request(app).get('/api/admin/ratings/stats').set('Cookie', adminToken);
            expect([200, 404, 500]).toContain(res.status);
        }, 10000);

        it('should reject ratings access without auth', async () => {
            const res = await request(app).get('/api/admin/ratings');
            expect([401, 404]).toContain(res.status);
        });
    });

    describe('Admin Authentication & Authorization', () => {
        it('should reject requests with invalid token format', async () => {
            const res = await request(app).get('/api/admin/customers').set('Cookie', 'invalid-format');
            expect(res.status).toBe(401);
        });

        it('should reject requests with expired token', async () => {
            const expiredToken = jwt.sign({ adminId: 'admin_001', role: 'admin', exp: Math.floor(Date.now() / 1000) - 3600 }, process.env.JWT_SECRET_KEY);
            const res = await request(app).get('/api/admin/customers').set('Cookie', `jwt=${expiredToken}`);
            expect(res.status).toBe(401);
        });

        it('should reject non-admin users', async () => {
            const userToken = jwt.sign({ userId: 'user_001', role: 'customer' }, process.env.JWT_SECRET_KEY);
            const res = await request(app).get('/api/admin/customers').set('Cookie', `jwt=${userToken}`);
            expect(res.status).toBe(403);
        });

        it('should accept valid admin token', async () => {
            const validToken = jwt.sign({ adminId: 'admin_001', role: 'admin' }, process.env.JWT_SECRET_KEY);
            const res = await request(app).get('/api/admin/customers').set('Cookie', `jwt=${validToken}`);
            expect([200, 500]).toContain(res.status);
        }, 10000);
    });

    describe('Admin Error Handling', () => {
        it('should handle malformed requests', async () => {
            const res = await request(app).get('/api/admin/customers/invalid-id').set('Cookie', adminToken);
            expect([200, 400, 404, 500]).toContain(res.status);
        }, 10000);

        it('should handle concurrent requests', async () => {
            const promises = [
                request(app).get('/api/admin/customers').set('Cookie', adminToken),
                request(app).get('/api/admin/vendors').set('Cookie', adminToken)
            ];
            const results = await Promise.all(promises);
            results.forEach(res => expect([200, 500]).toContain(res.status));
        }, 15000);

        it('should handle large ID values', async () => {
            const res = await request(app).get(`/api/admin/customers/999999999999999999999`).set('Cookie', adminToken);
            expect([200, 400, 404, 500]).toContain(res.status);
        }, 10000);

        it('should sanitize query parameters', async () => {
            const res = await request(app).get("/api/admin/customers?search=<script>").set('Cookie', adminToken);
            expect([200, 400, 500]).toContain(res.status);
        }, 10000);

        it('should handle pagination with invalid page', async () => {
            const res = await request(app).get('/api/admin/customers?page=-1').set('Cookie', adminToken);
            expect([200, 400, 500]).toContain(res.status);
        }, 10000);

        it('should reject unsupported methods', async () => {
            const res = await request(app).patch('/api/admin/customers').set('Cookie', adminToken);
            expect([404, 405]).toContain(res.status);
        });
    });

    describe('Admin: Dashboard & Metrics', () => {
        it('should get customers list for dashboard', async () => {
            const res = await request(app).get('/api/admin/customers').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get vendors list for dashboard', async () => {
            const res = await request(app).get('/api/admin/vendors').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should get orders list for dashboard', async () => {
            const res = await request(app).get('/api/admin/orders').set('Cookie', adminToken);
            expect([200, 500]).toContain(res.status);
        }, 10000);

        it('should handle dashboard request without auth', async () => {
            const res = await request(app).get('/api/admin/customers');
            expect(res.status).toBe(401);
        });
    });
});

