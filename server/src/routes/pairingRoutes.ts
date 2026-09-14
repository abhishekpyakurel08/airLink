import { Router, Request, Response } from 'express';
import { PairingService } from '../services/pairingService';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Extension requests QR code pairing session
router.post('/pairing/init', async (req: Request, res: Response) => {
  try {
    const { extensionDeviceId, serverUrl } = req.body;
    if (!extensionDeviceId) {
      return res.status(400).json({ error: 'extensionDeviceId is required' });
    }

    const hostHeader = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' ? 'wss' : 'ws';
    const defaultServerUrl = `${protocol}://${hostHeader}`;
    const targetServerUrl = serverUrl || defaultServerUrl;

    const result = await PairingService.initPairing(extensionDeviceId, targetServerUrl);
    return res.json(result);
  } catch (err: any) {
    console.error('[Pairing API Init Error]', err);
    return res.status(500).json({ error: err.message || 'Failed to initialize pairing' });
  }
});

// Mobile app confirms QR pairing
router.post('/pairing/confirm', async (req: Request, res: Response) => {
  try {
    const { sessionToken, mobileDeviceId } = req.body;
    if (!sessionToken || !mobileDeviceId) {
      return res.status(400).json({ error: 'sessionToken and mobileDeviceId are required' });
    }

    const result = await PairingService.confirmPairing(sessionToken, mobileDeviceId);
    return res.json(result);
  } catch (err: any) {
    console.error('[Pairing API Confirm Error]', err);
    return res.status(400).json({ error: err.message || 'Failed to confirm pairing' });
  }
});

export default router;
