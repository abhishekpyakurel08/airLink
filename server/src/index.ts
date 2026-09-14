import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMongo, initRedis } from './config/db';
import pairingRoutes from './routes/pairingRoutes';
import { setupWebSocketServer } from './websocket/wsHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Attach REST routes
app.use('/api', pairingRoutes);

const server = http.createServer(app);

// Initialize WebSocket server
setupWebSocketServer(server);

// Start server and initialize databases
async function startServer() {
  await connectMongo();
  initRedis();

  server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 airLink Backend Server running on port ${PORT}`);
    console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/ws`);
    console.log(`🔗 REST endpoint:      http://localhost:${PORT}/api`);
    console.log(`=================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start airLink server:', err);
});
