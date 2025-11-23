# 🌾 AgriPulse - Agricultural Marketplace Platform

**Version 0.7**

AgriPulse is a modern agricultural marketplace platform that connects farmers, buyers, and drivers in Kenya. Built with React, Node.js, and MongoDB, it enables real-time matching of agricultural produce with market demands, facilitating seamless transactions and logistics coordination.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/Matizkim/AGRIPULSE)
[![Version](https://img.shields.io/badge/version-0.7-green)](https://github.com/Matizkim/AGRIPULSE)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **Produce Listings**: Farmers can post their agricultural products with details, quantities, and pricing
- **Market Demands**: Buyers can post demands for specific crops and quantities
- **Smart Matching**: Automatic matching between produce listings and market demands
- **Real-time Updates**: Socket.IO integration for instant notifications
- **SMS Notifications**: Africa's Talking integration for SMS alerts
- **User Authentication**: Secure authentication using Clerk
- **Modern UI**: Beautiful, responsive interface built with React and TailwindCSS
- **Transport Pool**: Driver management for logistics coordination

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Clerk** - Authentication
- **Axios** - HTTP client
- **Heroicons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time communication
- **Clerk** - Authentication middleware
- **Africa's Talking** - SMS service
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
AGRIPULSE/
├── agripulse-backend/          # Backend API server
│   ├── src/
│   │   ├── config/             # Database configuration
│   │   ├── models/             # Mongoose models
│   │   ├── routes/             # API routes
│   │   ├── utils/              # Utility functions
│   │   └── workers/            # Background workers
│   ├── server.js               # Entry point
│   └── package.json
│
├── agripulse-frontend/         # Frontend React application
│   ├── src/
│   │   ├── api/                # API client functions
│   │   ├── components/         # React components
│   │   ├── contexts/           # React contexts
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   ├── styles/             # Global styles
│   │   └── utils/              # Utility functions
│   ├── index.html
│   └── package.json
│
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB database (local or cloud)
- Clerk account (for authentication)
- Africa's Talking account (for SMS)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Matizkim/AGRIPULSE.git
   cd AGRIPULSE
   ```

2. **Setup Backend**
   ```bash
   cd agripulse-backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd agripulse-frontend
   npm install
   # Create .env.local file with your configuration
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 🔐 Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/agripulse

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key

# Africa's Talking SMS
AT_USERNAME=your_at_username
AT_API_KEY=your_at_api_key
AT_SENDER_NAME=AgriPulse
```

### Frontend (.env.local)

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Health Check
- `GET /health` - Server health status

#### Produce
- `GET /api/produce` - Get all produce listings
- `POST /api/produce` - Create a produce listing (Authenticated)

#### Demand
- `GET /api/demand` - Get all market demands
- `POST /api/demand` - Create a market demand (Authenticated)

#### Matches
- `GET /api/match` - Get all matches
- `POST /api/match` - Create a match (Authenticated)

#### SMS
- `POST /api/sms/send` - Send SMS notification

### Socket.IO Events

**Client → Server:**
- `joinRoom` - Join a location-specific room (e.g., "Nairobi:tomatoes")
- `leaveRoom` - Leave a room

**Server → Client:**
- `newListing` - New produce listing created
- `newDemand` - New market demand created
- `newMatch` - New match created

## 🚢 Deployment

### Backend Deployment

1. Set environment variables on your hosting platform
2. Ensure MongoDB is accessible
3. Deploy to platforms like:
   - Heroku
   - Railway
   - Render
   - AWS EC2
   - DigitalOcean

### Frontend Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Deploy to platforms like:
   - Vercel
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Matizkim** - [GitHub](https://github.com/Matizkim)

## 🙏 Acknowledgments

- Built for SDG-aligned agritech in Kenya
- Empowering local farmers and connecting communities
- Special thanks to PLP Africa for the platform

## 📞 Support

For support, email support@agripulse.com or open an issue in the repository.

---

**Made with ❤️ in Kenya**

