import request from 'supertest';
import { createApp } from '../app.js';
import { jest } from '@jest/globals';

// Set up required environment variables for testing
beforeAll(() => {
    process.env.JWT_SECRET_KEY = 'test-secret';
    process.env.NODE_ENV = 'test';
    // Mock cloudinary and other remote services if needed
});

describe('Authentication API', () => {
    let app;

    beforeAll(() => {
        // Create an app instance without external logging to reduce noise
        app = createApp({ enableLogging: false, initializePassport: false });
    });

    describe('POST /api/auth/signup', () => {
        it('should require all fields', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({ userName: 'TestUser' }); // missing email and password

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('All fields are required');
        });

        it('should require a valid email format', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({ 
                    userName: 'TestUser', 
                    email: 'invalid-email', 
                    password: 'password123' 
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid email format');
        });

        it('should require a password of at least 6 characters', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({ 
                    userName: 'TestUser', 
                    email: 'test@gmail.com', 
                    password: '123' 
                });

            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Password Must have 6 characters');
        });

        it('should successfully register a new user and return a JWT cookie', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({ 
                    userName: 'NewUser', 
                    email: 'newtest@gmail.com', 
                    password: 'password123' 
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.user).toHaveProperty('customerId');
            expect(res.body.user.email).toBe('newtest@gmail.com');
            expect(res.body.user.role).toBe('customer');

            // Check if JWT cookie is set
            const cookies = res.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies[0]).toMatch(/jwt=/);
        });

        it('should prevent registering an already registered email', async () => {
            // First signup
            await request(app).post('/api/auth/signup').send({ 
                userName: 'UserOne', 
                email: 'duplicate@gmail.com', 
                password: 'password123' 
            });

            // Second signup with same email
            const res = await request(app)
                .post('/api/auth/signup')
                .send({ 
                    userName: 'UserTwo', 
                    email: 'duplicate@gmail.com', 
                    password: 'password456' 
                });

            expect(res.status).toBe(409);
            expect(res.body.message).toBe('Email is already registered');
        });
    });

    describe('POST /api/auth/signin', () => {
        beforeEach(async () => {
            // Register a user before signin tests
            await request(app)
                .post('/api/auth/signup')
                .send({ 
                    userName: 'SigninUser', 
                    email: 'signin@gmail.com', 
                    password: 'password123' 
                });
        });

        it('should login a registered user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/signin')
                .send({ 
                    email: 'signin@gmail.com', 
                    password: 'password123' 
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user.email).toBe('signin@gmail.com');
        });

        it('should reject invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/signin')
                .send({ 
                    email: 'signin@gmail.com', 
                    password: 'wrongpassword' 
                });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid email or password');
        });

        it('should reject unregistered email', async () => {
            const res = await request(app)
                .post('/api/auth/signin')
                .send({ 
                    email: 'nonexistent@gmail.com', 
                    password: 'password123' 
                });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Email is not registered');
        });
    });
});
