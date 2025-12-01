# AgriPulse Frontend

**Version 0.7**

Modern, responsive React frontend for the AgriPulse agricultural marketplace platform. Built with React, Vite, and TailwindCSS.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Pages](#pages)
- [Components](#components)
- [API Integration](#api-integration)
- [Socket.IO Integration](#socketio-integration)
- [Authentication](#authentication)
- [Building for Production](#building-for-production)

## ✨ Features

- 🎨 Modern, professional UI with TailwindCSS
- 📱 Fully responsive design
- 🔐 User authentication with Clerk
- 🔄 Real-time updates via Socket.IO
- 📊 Interactive cards for produce, demand, and matches
- 🎯 Intuitive navigation and user experience
- ⚡ Fast development with Vite
- 🎭 Beautiful animations and transitions

## 🛠 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Clerk React** - Authentication
- **Axios** - HTTP client
- **Heroicons** - Icon library

## 📁 Project Structure

```
agripulse-frontend/
├── src/
│   ├── api/                    # API client functions
│   │   ├── axiosInstance.js   # Axios configuration
│   │   ├── produce.js         # Produce API calls
│   │   ├── demand.js          # Demand API calls
│   │   ├── match.js           # Match API calls
│   │   └── sms.js             # SMS API calls
│   ├── components/             # Reusable components
│   │   ├── Header.jsx         # Navigation header
│   │   ├── Footer.jsx         # Footer component
│   │   ├── ProduceCard.jsx   # Produce listing card
│   │   ├── DemandCard.jsx     # Market demand card
│   │   └── MatchCard.jsx      # Match card
│   ├── contexts/               # React contexts
│   │   └── SocketContext.jsx  # Socket.IO context
│   ├── hooks/                  # Custom React hooks
│   │   └── useAuthFetch.js    # Authenticated fetch hook
│   ├── pages/                  # Page components
│   │   ├── Home.jsx           # Landing page
│   │   ├── Produce.jsx        # Produce listings page
│   │   ├── Demand.jsx         # Market demands page
│   │   ├── Matches.jsx        # Matches page
│   │   └── SMS.jsx            # SMS testing page
│   ├── styles/                 # Global styles
│   │   └── tailwind.css       # TailwindCSS imports
│   ├── utils/                  # Utility functions
│   │   └── helper.js          # Helper functions
│   ├── App.jsx                 # Main app component
│   └── main.jsx                # Application entry point
├── index.html                  # HTML template
├── package.json
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # TailwindCSS configuration
└── postcss.config.js          # PostCSS configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Backend API running (see backend README)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   # Create .env.local file
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

## 📄 Pages

### Home (`/`)
- Landing page with hero section
- Feature overview
- Quick action buttons
- Getting started guide

### Produce (`/produce`)
- View all produce listings
- Create new produce listing
- Filter by crop and county
- Real-time updates

### Demand (`/demand`)
- View all market demands
- Post new market demand
- Filter by crop and county
- Real-time updates

### Matches (`/matches`)
- View all matches
- Create new matches
- Match details with listing and demand info

### SMS (`/sms`)
- Test SMS functionality
- Send SMS notifications
- View SMS status

## 🧩 Components

### Header
- Navigation menu with icons
- User authentication buttons
- Responsive design
- Active route highlighting

### Footer
- Links to main pages
- About information
- Copyright notice

### ProduceCard
- Display produce listing details
- Crop, quantity, location, price
- Hover effects and animations

### DemandCard
- Display market demand details
- Crop, quantity needed, location, offer
- Status indicators

### MatchCard
- Display match information
- Listing and demand details
- Agreed price
- Two-column layout

## 🔌 API Integration

API calls are made through the `api/` directory using Axios.

### Example Usage

```javascript
import { fetchProduce } from '../api/produce';
import useAuthFetch from '../hooks/useAuthFetch';

// Public API call
const listings = await fetchProduce();

// Authenticated API call
const authFetch = useAuthFetch();
const response = await authFetch.post('/produce', data);
```

## 🔄 Socket.IO Integration

Real-time updates are handled through Socket.IO context.

### Usage

```javascript
import { useSocket } from '../contexts/SocketContext';

function MyComponent() {
  const socket = useSocket();
  
  useEffect(() => {
    if (socket) {
      socket.on('newListing', (listing) => {
        console.log('New listing:', listing);
      });
      
      return () => {
        socket.off('newListing');
      };
    }
  }, [socket]);
}
```

## 🔒 Authentication

Authentication is handled using Clerk React SDK.

### Protected Routes

Routes are protected using the `Protected` component:

```javascript
<Route path="/produce" element={<Protected><ProducePage /></Protected>} />
```

### Authenticated API Calls

Use the `useAuthFetch` hook for authenticated requests:

```javascript
const authFetch = useAuthFetch();
const response = await authFetch.post('/produce', data);
```

## 🎨 Styling

The application uses TailwindCSS for styling with a custom color scheme:

- **Primary**: Green (`green-600`, `green-700`)
- **Secondary**: Emerald (`emerald-600`, `emerald-700`)
- **Background**: Gradient from green-50 to emerald-50

### Customization

Edit `tailwind.config.js` to customize the theme:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Add custom colors
      }
    }
  }
}
```

## 🏗 Building for Production

### Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview

```bash
npm run preview
```

Preview the production build locally.

### Deploy

Deploy the `dist/` directory to your hosting platform:

- **Vercel**: Connect GitHub repository
- **Netlify**: Drag and drop `dist/` folder
- **GitHub Pages**: Use GitHub Actions
- **AWS S3**: Upload `dist/` contents

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐛 Troubleshooting

### API Connection Issues
- Verify `VITE_API_URL` in `.env.local`
- Ensure backend server is running
- Check CORS configuration on backend

### Authentication Issues
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is correct
- Check Clerk dashboard for configuration
- Ensure backend Clerk secret key matches

### Socket.IO Connection Issues
- Verify `VITE_SOCKET_URL` in `.env.local`
- Check backend Socket.IO configuration
- Ensure WebSocket connections are allowed

## 📄 License

This project is licensed under the MIT License.

---

**Version 0.7** | Built for AgriPulse Platform
