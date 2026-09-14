"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const pairingRoutes_1 = __importDefault(require("./routes/pairingRoutes"));
const wsHandler_1 = require("./websocket/wsHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Attach REST routes
app.use('/api', pairingRoutes_1.default);
const server = http_1.default.createServer(app);
// Initialize WebSocket server
(0, wsHandler_1.setupWebSocketServer)(server);
// Start server and initialize databases
async function startServer() {
    await (0, db_1.connectMongo)();
    (0, db_1.initRedis)();
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
