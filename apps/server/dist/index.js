"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const pairingRoutes_1 = __importDefault(require("./routes/pairingRoutes"));
const wsGateway_1 = require("./websocket/wsGateway");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', pairingRoutes_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'AirLink Server', timestamp: new Date().toISOString() });
});
const server = http_1.default.createServer(app);
(0, wsGateway_1.setupWebSocketGateway)(server);
server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 AirLink Monorepo Backend Server running on port ${PORT}`);
    console.log(`📡 WebSocket Gateway: ws://localhost:${PORT}/ws`);
    console.log(`=================================================`);
});
