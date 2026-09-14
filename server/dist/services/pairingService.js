"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairingService = void 0;
const uuid_1 = require("uuid");
const db_1 = require("../config/db");
const DevicePair_1 = require("../models/DevicePair");
const PAIR_SESSION_TTL = 300; // 5 minutes
class PairingService {
    /**
     * Initializes a QR code pairing session for a Chrome Extension device
     */
    static async initPairing(extensionDeviceId, serverUrl) {
        const pairId = (0, uuid_1.v4)();
        const sessionToken = Math.random().toString(36).substring(2, 8).toUpperCase();
        const pairSecret = (0, uuid_1.v4)();
        const sessionData = {
            pairId,
            extensionDeviceId,
            pairSecret
        };
        // Store ephemeral session in Redis with TTL
        await db_1.redisClient.set(`pair_session:${sessionToken}`, JSON.stringify(sessionData), 'EX', PAIR_SESSION_TTL);
        // Persist pending device pair entry in MongoDB
        await DevicePair_1.DevicePair.create({
            pairId,
            extensionDeviceId,
            pairSecret,
            status: 'pending'
        });
        const qrPayload = JSON.stringify({
            pairId,
            sessionToken,
            serverUrl
        });
        return {
            sessionToken,
            pairId,
            qrPayload,
            expiresInSeconds: PAIR_SESSION_TTL
        };
    }
    /**
     * Confirms pairing when mobile app scans QR code and sends sessionToken
     */
    static async confirmPairing(sessionToken, mobileDeviceId) {
        const rawData = await db_1.redisClient.get(`pair_session:${sessionToken}`);
        if (!rawData) {
            throw new Error('Invalid or expired QR pairing session token');
        }
        const { pairId, extensionDeviceId, pairSecret } = JSON.parse(rawData);
        // Update MongoDB status
        const pair = await DevicePair_1.DevicePair.findOneAndUpdate({ pairId }, {
            mobileDeviceId,
            status: 'paired',
            pairedAt: new Date()
        }, { new: true });
        if (!pair) {
            throw new Error('Device pair record not found');
        }
        // Clean up ephemeral token from Redis
        await db_1.redisClient.del(`pair_session:${sessionToken}`);
        return {
            success: true,
            pairId,
            extensionDeviceId,
            mobileDeviceId,
            pairSecret
        };
    }
    /**
     * Authenticates a device connection attempt against MongoDB
     */
    static async validateDeviceAuth(pairId, deviceId, pairSecret, role) {
        const pair = await DevicePair_1.DevicePair.findOne({ pairId, pairSecret, status: 'paired' });
        if (!pair)
            return false;
        if (role === 'extension') {
            return pair.extensionDeviceId === deviceId;
        }
        else {
            return pair.mobileDeviceId === deviceId;
        }
    }
}
exports.PairingService = PairingService;
