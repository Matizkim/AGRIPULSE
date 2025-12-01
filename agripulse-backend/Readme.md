# AgriPulse Backend API

**Version 0.7**

RESTful API server for the AgriPulse agricultural marketplace platform. Built with Node.js, Express, and MongoDB.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Socket.IO](#socketio)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [SMS Integration](#sms-integration)

## ✨ Features

- RESTful API endpoints for produce, demand, and matches
- Real-time updates via Socket.IO
- User authentication with Clerk
- SMS notifications via Africa's Talking
- MongoDB database with Mongoose ODM
- Security middleware (Helmet, CORS, Rate Limiting)
- Error handling and logging

## 🛠 Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **Clerk** - Authentication service
- **Africa's Talking** - SMS API
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting middleware

## 📁 Project Structure

```
agripulse-backend/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User model
│   │   ├── ProduceListing.js  # Produce listing model
│   │   ├── MarketDemand.js    # Market demand model
│   │   ├── Match.js           # Match model
│   │   ├── TransportPool.js   # Transport pool model
│   │   └── SmsLog.js          # SMS log model
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── produce.js         # Produce listing routes
│   │   ├── demand.js          # Market demand routes
│   │   ├── match.js           # Match routes
│   │   └── sms.js             # SMS routes
│   ├── utils/
│   │   ├── africasTalking.js  # Africa's Talking integration
│   │   ├── clerkVerify.js     # Clerk authentication middleware
│   │   └── fakeAuth.js        # Development auth bypass
│   └── workers/
│       └── mlWorker.js        # Machine learning worker (stub)
├── server.js                  # Application entry point
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB (local or cloud instance)
- Clerk account
- Africa's Talking account (optional, for SMS)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Start production server**
   ```bash
   npm start
   ```

The server will run on `http://localhost:5000` by default.

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/agripulse
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agripulse

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Africa's Talking SMS
AT_USERNAME=sandbox
AT_API_KEY=your_api_key_here
AT_SENDER_NAME=AgriPulse

# Production SMS Sender (optional)
# AT_SENDER_NAME=AgriPulse
```

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Health Check
```
GET /health
```
Returns server health status.

### Produce Listings

#### Get All Produce Listings
```
GET /api/produce
Query Parameters:
  - crop: Filter by crop type (optional)
  - county: Filter by county (optional)
```

#### Create Produce Listing
```
POST /api/produce
Headers:
  Authorization: Bearer <clerk_token>
Body:
  {
    "crop": "tomatoes",
    "quantityKg": 100,
    "expectedPrice": 5000,
    "location": {
      "county": "Nairobi",
      "lat": -1.2921,
      "lng": 36.8219
    },
    "harvestDate": "2024-02-15"
  }
```

### Market Demands

#### Get All Market Demands
```
GET /api/demand
Query Parameters:
  - crop: Filter by crop type (optional)
  - county: Filter by county (optional)
```

#### Create Market Demand
```
POST /api/demand
Headers:
  Authorization: Bearer <clerk_token>
Body:
  {
    "crop": "tomatoes",
    "qtyKg": 50,
    "priceOffer": 2500,
    "location": {
      "county": "Nairobi",
      "lat": -1.2921,
      "lng": 36.8219
    },
    "expiresAt": "2024-02-20"
  }
```

### Matches

#### Get All Matches
```
GET /api/match
```

#### Create Match
```
POST /api/match
Headers:
  Authorization: Bearer <clerk_token>
Body:
  {
    "listingId": "507f1f77bcf86cd799439011",
    "demandId": "507f1f77bcf86cd799439012",
    "priceAgreed": 4000
  }
```

### SMS

#### Send SMS
```
POST /api/sms/send
Body:
  {
    "to": "+254712345678",
    "message": "Your produce has been matched!"
  }
```

## 🔌 Socket.IO

### Connection
```javascript
const socket = io('http://localhost:5000');
```

### Client Events

#### Join Room
```javascript
socket.emit('joinRoom', 'Nairobi:tomatoes');
```

#### Leave Room
```javascript
socket.emit('leaveRoom', 'Nairobi:tomatoes');
```

### Server Events

#### New Listing
```javascript
socket.on('newListing', (listing) => {
  console.log('New produce listing:', listing);
});
```

#### New Demand
```javascript
socket.on('newDemand', (demand) => {
  console.log('New market demand:', demand);
});
```

#### New Match
```javascript
socket.on('newMatch', (match) => {
  console.log('New match created:', match);
});
```

## 🗄 Database Models

### User
- `clerkId`: String (unique)
- `name`: String
- `phone`: String
- `role`: Enum ['farmer', 'buyer', 'driver', 'admin']
- `location`: Object { county, lat, lng }
- `createdAt`: Date

### ProduceListing
- `farmerId`: String (Clerk user ID)
- `crop`: String
- `quantityKg`: Number
- `harvestDate`: Date
- `expectedPrice`: Number
- `location`: Object { county, lat, lng }
- `images`: Array[String]
- `status`: Enum ['available', 'matched', 'sold']
- `createdAt`: Date

### MarketDemand
- `buyerId`: String (Clerk user ID)
- `crop`: String
- `qtyKg`: Number
- `priceOffer`: Number
- `pickupWindow`: Object { start, end }
- `location`: Object { county, lat, lng }
- `status`: Enum ['open', 'fulfilled', 'expired']
- `postedAt`: Date
- `expiresAt`: Date

### Match
- `listingId`: ObjectId (ref: ProduceListing)
- `demandId`: ObjectId (ref: MarketDemand)
- `priceAgreed`: Number
- `driverId`: ObjectId (ref: User, optional)
- `status`: Enum ['requested', 'accepted', 'in_transit', 'completed', 'cancelled']
- `createdAt`: Date

## 🔒 Authentication

Authentication is handled using Clerk. The middleware is currently disabled for development but can be enabled by uncommenting the middleware in `server.js`.

### Enabling Authentication

1. Uncomment the Clerk middleware in `server.js`:
   ```javascript
   app.use(clerkMiddlewareAdapter);
   ```

2. Ensure `CLERK_SECRET_KEY` is set in `.env`

3. All routes using `requireAuth()` will be protected

## 📱 SMS Integration

SMS functionality is provided via Africa's Talking API.

### Setup

1. Sign up at [Africa's Talking](https://africastalking.com)
2. Get your API credentials
3. Add to `.env`:
   ```env
   AT_USERNAME=sandbox
   AT_API_KEY=your_api_key
   ```

### Usage

For production, set `AT_SENDER_NAME` to your registered sender ID.

## 🧪 Testing

```bash
# Run in development mode with auto-reload
npm run dev

# Run in production mode
npm start
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity for cloud instances

### Clerk Authentication Issues
- Verify `CLERK_SECRET_KEY` is correct
- Check token format in request headers
- Ensure middleware is properly configured

### SMS Not Sending
- Verify Africa's Talking credentials
- Check SMS logs in database
- Ensure phone numbers are in E.164 format (+254...)

## 📄 License

This project is licensed under the MIT License.

---

**Version 0.7** | Built for AgriPulse Platform
