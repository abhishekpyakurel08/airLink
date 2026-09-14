"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairingService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const PairingSession_1 = require("../models/PairingSession");
const Session_1 = require("../models/Session");
const EXPIRATION_SECONDS = 60; // Short-lived 60-second QR token for 1-second pairing
class PairingService {
    /**
     * Generates a short-lived ephemeral pairing session for Chrome Extension
     */
    static async generatePairingCode(extensionDeviceId) {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const codeHash = crypto_1.default.createHash('sha256').update(code).digest('hex');
        const expiresAt = new Date(Date.now() + EXPIRATION_SECONDS * 1000);
        await PairingSession_1.PairingSession.create({
            code_hash: codeHash,
            initiator_device: extensionDeviceId,
            status: 'pending',
            expires_at: expiresAt
        });
        const qrPayload = `airlink://pair/${code}`;
        return {
            code,
            codeHash,
            qrPayload,
            expiresInSeconds: EXPIRATION_SECONDS
        };
    }
    /**
     * Validates pairing code sent from phone app and establishes device session
     */
    static async validateAndPair(code, phoneDeviceId) {
        const codeHash = crypto_1.default.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
        const pairingDoc = await PairingSession_1.PairingSession.findOne({
            code_hash: codeHash,
            status: 'pending',
            expires_at: { $gt: new Date() }
        });
        if (!pairingDoc) {
            throw new Error('QR pairing code expired or invalid');
        }
        pairingDoc.status = 'paired';
        pairingDoc.target_device = phoneDeviceId;
        await pairingDoc.save();
        // Create persistent paired session
        const session = await Session_1.Session.create({
            device_a: pairingDoc.initiator_device, // Chrome Extension
            device_b: phoneDeviceId, // Mobile App
            status: 'active',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 day session
        });
        return {
            success: true,
            sessionId: session._id.toString(),
            extensionDeviceId: pairingDoc.initiator_device,
            phoneDeviceId
        };
    }
}
exports.PairingService = PairingService;
