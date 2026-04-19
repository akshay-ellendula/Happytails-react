import redis from '../config/redis.js';

/**
 * Redis Cache Middleware Factory
 * 
 * Creates an Express middleware that caches JSON responses in Upstash Redis.
 * On cache HIT, the response is served instantly from Redis (sub-millisecond).
 * On cache MISS, the response is intercepted, stored in Redis, then forwarded.
 * 
 * @param {number} ttl - Time-to-live in seconds for the cached data  
 * @param {function} [keyGenerator] - Optional custom key generator (req) => string
 * @returns {function} Express middleware
 * 
 * TTL Guidelines (tuned for best browsing experience):
 *  - Product listings:   120s  (products don't change every second)
 *  - Single product:      60s  (details viewed frequently, moderate freshness)
 *  - Public events:       60s  (event list changes when new events are added)   
 *  - Single event:        30s  (ticket counts change as people book)
 *  - Rating summaries:   300s  (ratings are slow-moving data)
 *  - Analytics/dashboards: 30s (managers want near-real-time stats)
 */
const cacheMiddleware = (ttl = 60, keyGenerator = null) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const cacheKey = keyGenerator 
            ? keyGenerator(req) 
            : `cache:${req.originalUrl}`;

        const startTime = performance.now();

        try {
            const cachedData = await redis.get(cacheKey);

            if (cachedData) {
                const duration = (performance.now() - startTime).toFixed(2);
                console.log(`⚡ CACHE HIT  | ${req.originalUrl} | ${duration}ms | key: ${cacheKey}`);

                // Upstash auto-deserializes JSON, so cachedData is already an object
                return res.status(200).json(cachedData);
            }
        } catch (redisErr) {
            // If Redis is down, just skip caching and serve from DB
            console.warn(`⚠️  Redis read error (falling back to DB): ${redisErr.message}`);
        }

        // --- Cache MISS: Intercept res.json to capture the response ---
        const originalJson = res.json.bind(res);

        res.json = async (body) => {
            const duration = (performance.now() - startTime).toFixed(2);
            console.log(`🐢 CACHE MISS | ${req.originalUrl} | ${duration}ms (DB query) | key: ${cacheKey}`);

            // Store in Redis asynchronously (don't block the response)
            try {
                await redis.set(cacheKey, JSON.stringify(body), { ex: ttl });
            } catch (redisErr) {
                console.warn(`⚠️  Redis write error: ${redisErr.message}`);
            }

            return originalJson(body);
        };

        next();
    };
};

/**
 * Invalidate cache entries by pattern prefix.
 * Call this after create/update/delete operations to bust stale cache.
 * 
 * @param {string[]} patterns - Array of cache key prefixes to invalidate
 *   Example: ['cache:/api/events', 'cache:/api/products']
 */
export const invalidateCache = async (...patterns) => {
    try {
        for (const pattern of patterns) {
            // Upstash supports SCAN-based pattern matching
            let cursor = 0;
            do {
                const result = await redis.scan(cursor, { match: `${pattern}*`, count: 100 });
                cursor = result[0];
                const keys = result[1];
                if (keys.length > 0) {
                    await redis.del(...keys);
                    console.log(`🗑️  Invalidated ${keys.length} cache keys matching: ${pattern}*`);
                }
            } while (cursor !== 0 && cursor !== "0");
        }
    } catch (err) {
        console.warn(`⚠️  Cache invalidation error: ${err.message}`);
    }
};

export default cacheMiddleware;
