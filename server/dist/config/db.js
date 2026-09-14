import mongoose from 'mongoose';
import Redis from 'ioredis';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airlink';
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
export let redisClient;
export async function connectMongo() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(`[MongoDB] Connected successfully to ${MONGO_URI}`);
    }
    catch (err) {
        console.error('[MongoDB] Connection error:', err);
    }
}
export function initRedis() {
    redisClient = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        retryStrategy(times) {
            const delay = Math.min(times * 100, 3000);
            return delay;
        },
        lazyConnect: true
    });
    redisClient.on('connect', () => {
        console.log(`[Redis] Connected successfully to ${REDIS_HOST}:${REDIS_PORT}`);
    });
    redisClient.on('error', (err) => {
        console.error('[Redis] Connection error:', err);
    });
    redisClient.connect().catch((err) => {
        console.error('[Redis] Initial connect error:', err);
    });
    return redisClient;
}
