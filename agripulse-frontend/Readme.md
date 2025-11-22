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



###########################################
AgriPulse Frontend (React + Vite + Tailwind)
###########################################
1. Copy .env.local example and set VITE_API_URL (http://localhost:5000/api)
2. npm install
3. npm run dev
4. Open http://localhost:3000

Auth:
- This repo ships with a dev sign-in button (AuthContext.signInMock)
- Replace with Clerk or JWT per your preference

Socket:
- Socket URL is VITE_SOCKET_URL (defaults to http://localhost:5000)


Frontend stack & structure

React (Vite) — lightweight and fast.

TailwindCSS — for rapid, consistent UI styling.

React Router v6 — page navigation (Home, Produce, Demand, Match, SMS).

Context + Hooks — global state for auth, socket connections, notifications.

Socket.IO-client — real-time updates for new demand/matches.

PWA config — optional offline support for farmers.

Folder structure (suggested):

agripulse-frontend/│  
├─ src/
│  ├─ api/
│  │  ├─ axiosInstance.js
│  │  ├─ produce.js
│  │  ├─ demand.js
│  │  ├─ match.js
│  │  └─ sms.js
│  ├─ components/
│  │  ├─ Header.jsx
│  │  ├─ Footer.jsx
│  │  ├─ ProduceCard.jsx
│  │  ├─ DemandCard.jsx
│  │  └─ MatchCard.jsx
│  │   
│  ├─ contexts/
│  │  └─ SocketContext.jsx
|  ├─ hooks/
│  │  └─ useAuthFetch.jsx
│  ├─ pages/
│  │  ├─ Home.jsx
│  │  ├─ Produce.jsx
│  │  ├─ Demand.jsx
│  │  ├─ Matches.jsx
│  │  └─ SMS.jsx
│  ├─ utils/
│  │  └─ helpers.js
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles/
│     └─ tailwind.css
├─ .env.local
├─ index.html
├─ package.json
├─ vite.config.js
├─ tailwind.config.cjs
├─ package-lock.json
├─ postcss.config.cjs
├─ Readme.md
└─ node_modules/


Add custom Kenyan SMS verification (Africa’s Talking / Safaricom SMS API)