import { Router } from 'express';
import { PairingService } from '../services/pairingService';

const router = Router();

// Extension requests 60s expiring QR pairing token
router.post('/pairing/init', async (req: any, res: any) => {
  try {
    const { extensionDeviceId } = req.body;
    if (!extensionDeviceId) {
      return res.status(400).json({ error: 'extensionDeviceId is required' });
    }
    const result = await PairingService.generatePairingCode(extensionDeviceId);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Phone scans QR code & confirms pairing in 1-second
router.post('/pairing/confirm', async (req: any, res: any) => {
  try {
    const { code, phoneDeviceId } = req.body;
    if (!code || !phoneDeviceId) {
      return res.status(400).json({ error: 'code and phoneDeviceId are required' });
    }
    const result = await PairingService.validateAndPair(code, phoneDeviceId);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
