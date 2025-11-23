# 🚀 AgriPulse Deployment Guide

Complete guide to deploy AgriPulse on free/cheap hosting platforms.

## 📊 Hosting Platform Recommendations

### **Best Free Options:**

1. **Render** ⭐ (Recommended for Backend)
   - Free tier: 750 hours/month
   - Automatic SSL
   - MongoDB Atlas integration
   - Perfect for Node.js backends

2. **Vercel** ⭐ (Recommended for Frontend)
   - Free tier: Unlimited
   - Automatic deployments from GitHub
   - Edge network (fast global CDN)
   - Perfect for React/Vite apps

3. **Railway** (Alternative)
   - Free tier: $5 credit/month
   - Easy MongoDB setup
   - Good for full-stack apps

4. **MongoDB Atlas** (Database)
   - Free tier: 512MB storage
   - Perfect for development/small apps

### **Cost Comparison:**

| Platform | Free Tier | Paid Starts At | Best For |
|----------|-----------|----------------|----------|
| Render | 750 hrs/month | $7/month | Backend APIs |
| Vercel | Unlimited | $20/month | Frontend apps |
| Railway | $5 credit | $5/month | Full-stack |
| MongoDB Atlas | 512MB | $9/month | Database |

## 🎯 Recommended Setup

- **Backend**: Render (Free)
- **Frontend**: Vercel (Free)
- **Database**: MongoDB Atlas (Free)

**Total Cost: $0/month** 🎉

---

## Part 1: Deploy Backend to Render

### Prerequisites

1. GitHub account
2. Render account (sign up at https://render.com)
3. MongoDB Atlas account (sign up at https://www.mongodb.com/cloud/atlas)

### Step 1: Push Code to GitHub

1. Make sure your code is pushed to GitHub (see GITHUB_SETUP.md)
2. Repository should be: `https://github.com/Matizkim/AGRIPULSE`

### Step 2: Setup MongoDB Atlas

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "M0 FREE" tier
   - Select region closest to you (e.g., AWS, Frankfurt)
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `agripulse_user`
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://agripulse_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/agripulse?retryWrites=true&w=majority`

### Step 3: Deploy to Render

1. **Create New Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect GitHub Repository**
   - Click "Connect GitHub"
   - Authorize Render
   - Select repository: `Matizkim/AGRIPULSE`

3. **Configure Service**
   - **Name**: `agripulse-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `agripulse-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Environment Variables**
   Click "Advanced" → "Add Environment Variable" and add:

   ```env
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://agripulse_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/agripulse?retryWrites=true&w=majority
   CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   AT_USERNAME=sandbox
   AT_API_KEY=your_africas_talking_api_key
   AT_SENDER_NAME=AgriPulse
   ```

   **Important**: Replace all placeholder values with your actual credentials!

5. **Deploy**
   - Click "Create Web Service"
   - Render will start building and deploying
   - Wait 5-10 minutes for first deployment

6. **Get Your Backend URL**
   - Once deployed, you'll get a URL like: `https://agripulse-backend.onrender.com`
   - Save this URL - you'll need it for frontend!

### Step 4: Update Backend Configuration

1. **Enable Clerk Middleware** (if using authentication)
   - In Render dashboard, go to your service
   - Click "Environment"
   - Ensure `CLERK_SECRET_KEY` is set
   - Uncomment Clerk middleware in `server.js` (if needed)

2. **Test Your Backend**
   - Visit: `https://your-backend-url.onrender.com/health`
   - Should return: `{"ok":true}`

---

## Part 2: Deploy Frontend to Vercel

### Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)

### Step 1: Prepare Frontend

1. **Update Environment Variables**
   - In `agripulse-frontend`, create `.env.production`:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_SOCKET_URL=https://your-backend-url.onrender.com
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
   ```

2. **Update CORS on Backend** (if needed)
   - In Render, add environment variable:
   ```env
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import from GitHub: `Matizkim/AGRIPULSE`

2. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `agripulse-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables**
   Click "Environment Variables" and add:

   ```env
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_SOCKET_URL=https://your-backend-url.onrender.com
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your URL: `https://agripulse-frontend.vercel.app`

#### Option B: Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd agripulse-frontend
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_API_URL
   vercel env add VITE_SOCKET_URL
   vercel env add VITE_CLERK_PUBLISHABLE_KEY
   ```

5. **Redeploy**
   ```bash
   vercel --prod
   ```

### Step 3: Update CORS on Backend

1. Go to Render dashboard
2. Add environment variable:
   ```env
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```

3. Or update `server.js` to allow your Vercel domain:
   ```javascript
   app.use(cors({
     origin: process.env.CORS_ORIGIN || 'https://your-frontend-url.vercel.app'
   }));
   ```

---

## Part 3: Post-Deployment Configuration

### 1. Update Frontend Environment Variables

After deployment, update Vercel environment variables with your actual backend URL.

### 2. Test Your Application

1. **Backend Health Check**
   - Visit: `https://your-backend.onrender.com/health`
   - Should return: `{"ok":true}`

2. **Frontend**
   - Visit your Vercel URL
   - Test authentication
   - Test API calls
   - Test Socket.IO connection

### 3. Enable Automatic Deployments

Both platforms automatically deploy when you push to GitHub:
- **Render**: Auto-deploys on push to `main` branch
- **Vercel**: Auto-deploys on push to `main` branch

### 4. Custom Domain (Optional)

#### Vercel Custom Domain
1. Go to Vercel dashboard → Your project → Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

#### Render Custom Domain
1. Go to Render dashboard → Your service → Settings → Custom Domain
2. Add your domain
3. Update DNS records

---

## 🔧 Troubleshooting

### Backend Issues

**Problem: Build fails**
- Check build logs in Render dashboard
- Ensure `package.json` has correct start script
- Verify all dependencies are in `package.json`

**Problem: Application crashes**
- Check logs in Render dashboard
- Verify environment variables are set correctly
- Test MongoDB connection string

**Problem: CORS errors**
- Add frontend URL to CORS_ORIGIN
- Update `server.js` CORS configuration

### Frontend Issues

**Problem: API calls fail**
- Verify `VITE_API_URL` is correct
- Check backend is running
- Verify CORS is configured

**Problem: Socket.IO not connecting**
- Verify `VITE_SOCKET_URL` is correct
- Check backend Socket.IO configuration
- Verify WebSocket support on Render

**Problem: Environment variables not working**
- Rebuild after adding environment variables
- Ensure variables start with `VITE_` for Vite
- Check variable names match exactly

### Database Issues

**Problem: MongoDB connection fails**
- Verify connection string is correct
- Check IP whitelist includes Render IPs
- Verify database user credentials

---

## 📊 Monitoring & Maintenance

### Render Monitoring

1. **View Logs**
   - Dashboard → Your service → Logs
   - Real-time application logs

2. **Metrics**
   - CPU usage
   - Memory usage
   - Request count

3. **Alerts**
   - Set up email alerts for crashes
   - Monitor uptime

### Vercel Monitoring

1. **Analytics**
   - View page views
   - Performance metrics
   - User analytics

2. **Logs**
   - Function logs
   - Build logs
   - Error tracking

---

## 💰 Cost Management

### Free Tier Limits

**Render:**
- 750 hours/month (enough for 24/7 operation)
- 512MB RAM
- Sleeps after 15 minutes of inactivity (free tier)

**Vercel:**
- Unlimited deployments
- 100GB bandwidth/month
- No sleep time

**MongoDB Atlas:**
- 512MB storage
- Shared cluster
- Perfect for development/small apps

### Upgrade When Needed

Upgrade if you need:
- More RAM (Render: $7/month)
- More storage (MongoDB: $9/month)
- Better performance
- No sleep time (Render: $7/month)

---

## 🔄 Continuous Deployment

### Automatic Deployments

Both platforms automatically deploy when you:
1. Push to `main` branch
2. Create a pull request (preview deployments)
3. Merge pull requests

### Manual Deployments

**Render:**
- Dashboard → Manual Deploy → Deploy latest commit

**Vercel:**
- Dashboard → Deployments → Redeploy

---

## 📝 Checklist

Before going live:

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] MongoDB Atlas configured
- [ ] Environment variables set correctly
- [ ] CORS configured
- [ ] Health check working
- [ ] Authentication working
- [ ] API endpoints tested
- [ ] Socket.IO tested
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active (automatic)

---

## 🎉 Success!

Your AgriPulse application is now live!

- **Backend**: `https://your-backend.onrender.com`
- **Frontend**: `https://your-frontend.vercel.app`
- **Database**: MongoDB Atlas (managed)

**Total Monthly Cost: $0** 🎊

---

## 📞 Support

- **Render Support**: https://render.com/docs
- **Vercel Support**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

**Happy Deploying! 🚀**

