//backed

agripulse-backend/
├─ package.json
├─ .env.example
├─ server.js
├─ src/
│  ├─ config/
│  │  └─ db.js
│  ├─ models/
│  │  ├─ User.js
│  │  ├─ ProduceListing.js
│  │  ├─ MarketDemand.js
│  │  ├─ Match.js
│  │  ├─ TransportPool.js
│  │  └─ SmsLog.js
│  ├─ routes/
│  │  ├─ auth.js
│  │  ├─ produce.js
│  │  ├─ demand.js
│  │  ├─ sms.js
│  │  └─ match.js
│  ├─ utils/
│  │  ├─ africasTalking.js
│  │  └─ clerkVerify.js
│  └─ workers/
│     └─ mlWorker.js
└─ README.md




# AgriPulse Backend (MVP)

## Setup
1. Copy `.env.example` to `.env` and fill values.
2. Install deps: `npm install`
3. Run dev server: `npm run dev` (requires nodemon)

## Endpoints (examples)
- GET /health
- POST /api/sms/send  { to, message }
- POST /api/produce   (Authenticated via Clerk token)
- GET /api/produce
- POST /api/demand
- GET /api/demand

## Socket.IO
Connect to ws://localhost:5000 and join rooms like "Nairobi:tomato"
Emit `joinRoom` with room string to receive `newDemand` events from server.

## Africa's Talking
Set `AT_USERNAME` and `AT_API_KEY` in env. Use `sandbox` for testing.

## Clerk
Set `CLERK_SECRET_KEY` in env (backend only). Frontend uses publishable key.


