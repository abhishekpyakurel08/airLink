import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import pairingRoutes from './routes/pairingRoutes';
import { setupWebSocketGateway } from './websocket/wsGateway';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'airlink_secret_key';

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(cookieParser(COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST Routes
app.use('/api', pairingRoutes);

app.get('/api/health', (req: any, res: any) => {
  res.json({
    status: 'ok',
    service: 'AirLink Server',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);

// WebSocket Gateway Setup
setupWebSocketGateway(server);

server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 AirLink Monorepo Backend Server running on port ${PORT}`);
  console.log(`📡 WebSocket Gateway: ws://localhost:${PORT}/ws`);
  console.log(`🔒 Cookie & HTTP Logger middleware initialized`);
  console.log(`=================================================`);
});
