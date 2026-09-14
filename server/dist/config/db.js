"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
exports.connectMongo = connectMongo;
exports.initRedis = initRedis;
const mongoose_1 = __importDefault(require("mongoose"));
const ioredis_1 = __importDefault(require("ioredis"));
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airlink';
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
async function connectMongo() {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log(`[MongoDB] Connected successfully to ${MONGO_URI}`);
    }
    catch (err) {
        console.error('[MongoDB] Connection error:', err);
    }
}
function initRedis() {
    exports.redisClient = new ioredis_1.default({
        host: REDIS_HOST,
        port: REDIS_PORT,
        retryStrategy(times) {
            const delay = Math.min(times * 100, 3000);
            return delay;
        },
        lazyConnect: true
    });
    exports.redisClient.on('connect', () => {
        console.log(`[Redis] Connected successfully to ${REDIS_HOST}:${REDIS_PORT}`);
    });
    exports.redisClient.on('error', (err) => {
        console.error('[Redis] Connection error:', err);
    });
    exports.redisClient.connect().catch((err) => {
        console.error('[Redis] Initial connect error:', err);
    });
    return exports.redisClient;
}
