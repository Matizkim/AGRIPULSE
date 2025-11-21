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
