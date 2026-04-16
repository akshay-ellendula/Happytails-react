import request from 'supertest';
import { createApp } from '../app.js';
import { jest } from '@jest/globals';

beforeAll(() => {
    process.env.JWT_SECRET_KEY = 'test-secret';
    process.env.NODE_ENV = 'test';
});

describe('Admin APIs', () => {
    let app;
    let adminToken;

    beforeAll(() => {
        app = createApp({ enableLogging: false, initializePassport: false });
    });

    describe('Auth: Admin Signup & Signin', () => {
        it('should signup a new admin', async () => {
            const res = await request(app)
                .post('/api/auth/adminSignup')
                .send({
                    userName: 'Test Admin',
                    email: 'admin_test@gmail.com',
                    password: 'password123'
                });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('should signin the hardcoded root admin', async () => {
            const res = await request(app)
                .post('/api/auth/adminSignin')
                .send({
                    email: 'admin@gmail.com',
                    password: 'admin123#'
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user.role).toBe('admin');
            
            const cookies = res.headers['set-cookie'];
            adminToken = cookies.find(c => c.startsWith('jwt=')).split(';')[0];
        });
    });

    describe('Admin Protected Routes: Customers', () => {
        it('should block access without admin token', async () => {
            const res = await request(app)
                .get('/api/admin/customers');
            expect(res.status).toBe(401); 
        });

        it('should get customers empty list when authenticated as admin', async () => {
            const res = await request(app)
                .get('/api/admin/customers')
                .set('Cookie', adminToken);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.users)).toBe(true);
        });
    });
});
