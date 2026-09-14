"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const pairingRoutes_1 = __importDefault(require("./routes/pairingRoutes"));
const wsGateway_1 = require("./websocket/wsGateway");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'airlink_secret_key';
// Middlewares
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use((0, cookie_parser_1.default)(COOKIE_SECRET));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// REST Routes
app.use('/api', pairingRoutes_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'AirLink Server',
        env: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});
const server = http_1.default.createServer(app);
// WebSocket Gateway Setup
(0, wsGateway_1.setupWebSocketGateway)(server);
server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 AirLink Monorepo Backend Server running on port ${PORT}`);
    console.log(`📡 WebSocket Gateway: ws://localhost:${PORT}/ws`);
    console.log(`🔒 Cookie & HTTP Logger middleware initialized`);
    console.log(`=================================================`);
});
