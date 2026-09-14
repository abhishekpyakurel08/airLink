"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pairingService_1 = require("../services/pairingService");
const router = (0, express_1.Router)();
// Extension requests 60s expiring QR pairing token
router.post('/pairing/init', async (req, res) => {
    try {
        const { extensionDeviceId } = req.body;
        if (!extensionDeviceId) {
            return res.status(400).json({ error: 'extensionDeviceId is required' });
        }
        const result = await pairingService_1.PairingService.generatePairingCode(extensionDeviceId);
        return res.json(result);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// Phone scans QR code & confirms pairing in 1-second
router.post('/pairing/confirm', async (req, res) => {
    try {
        const { code, phoneDeviceId } = req.body;
        if (!code || !phoneDeviceId) {
            return res.status(400).json({ error: 'code and phoneDeviceId are required' });
        }
        const result = await pairingService_1.PairingService.validateAndPair(code, phoneDeviceId);
        return res.json(result);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
exports.default = router;
