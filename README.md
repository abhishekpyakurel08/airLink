# airLink 📡📱

**airLink** is a real-time cross-device remote control system connecting a **React Native (Expo)** mobile app and a **Chrome Extension (Manifest V3)** through a **Node.js + TypeScript WebSocket Server** backed by **MongoDB** and **Redis**.

---

## 🌟 Key Features

- 📱 **Expo React Native App**:
  - 📷 **QR Code Scanner**: Instantly pair mobile device with Chrome extension by scanning QR code.
  - 🎵 **Media Controller**: Play/Pause, Next/Previous track, Volume & Mute control for desktop media.
  - 🌐 **Browser Tab Manager**: View live open tabs, activate tabs, close tabs, launch new URLs.
  - 🖱️ **Gesture Trackpad**: Gesture-based remote mouse movement, tap clicks, and smooth web scrolling.
  - 📋 **Remote Clipboard**: Instant text/link transfer to desktop browser clipboard.

- 🧩 **Chrome Extension (Manifest V3)**:
  - ⚡ **Background Service Worker**: Operates seamlessly in background using Chrome Tab & Scripting APIs.
  - 🖼️ **QR Code Generator**: Ephemeral pairing token popup rendering QR canvas.

- ⚙️ **Node.js + TypeScript Server**:
  - 🔒 **QR Pairing Engine**: Redis 5-minute TTL pairing session manager.
  - 💾 **MongoDB Persistence**: Mongoose models storing device pairs and activity logs.
  - ⚡ **Low-Latency WebSocket Relay**: Bi-directional real-time messaging between mobile & browser.

---

## 📂 Repository Structure

```
airLink/
├── shared/         # @airlink/shared - WebSocket types, REST contracts
├── server/         # @airlink/server - Express + WS Server (MongoDB & Redis)
├── extension/      # @airlink/extension - Manifest V3 Chrome Extension
└── mobile/         # @airlink/mobile - Expo React Native App
```

---

## 🚀 Quick Start Guide

### 1. Start MongoDB & Redis Services

```bash
cd server
docker-compose up -d
```
*(Or use local services `mongod` on port 27017 and `redis-server` on port 6379)*

### 2. Build & Start the Server

```bash
cd server
npm install
npm run build
npm start
```
- Server running at: `http://localhost:3000`
- WebSocket server at: `ws://localhost:3000/ws`

### 3. Load Chrome Extension

```bash
cd extension
npm install
npm run build
```
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (top right toggle).
3. Click **Load unpacked** and select the directory: `/home/socialworker/Desktop/airLink/extension/public`.
4. Click the **airLink** extension icon to reveal the QR Code!

### 4. Start Expo Mobile App

```bash
cd mobile
npm install
npx expo start
```
1. Scan the QR code displayed in Metro terminal or Expo Go app on your physical iOS/Android phone or simulator.
2. Grant camera permissions when prompted.
3. Point phone camera at the Chrome Extension QR code to instantly pair!
