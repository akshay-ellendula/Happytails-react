import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client using environment variables
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Verify the connection on startup
redis.ping()
    .then(() => console.log('✅ Upstash Redis connected successfully'))
    .catch((err) => console.error('❌ Upstash Redis connection failed:', err.message));

export default redis;
