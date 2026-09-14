import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pairingRoutes from './routes/pairingRoutes';
import { setupWebSocketGateway } from './websocket/wsGateway';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', pairingRoutes);

app.get('/api/health', (req: any, res: any) => {
  res.json({ status: 'ok', service: 'AirLink Server', timestamp: new Date().toISOString() });
});

const server = http.createServer(app);

setupWebSocketGateway(server);

server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 AirLink Monorepo Backend Server running on port ${PORT}`);
  console.log(`📡 WebSocket Gateway: ws://localhost:${PORT}/ws`);
  console.log(`=================================================`);
});
