# ⚡ Quick Deployment Reference

Quick commands and steps for deploying AgriPulse.

## 🚀 One-Page Deployment Checklist

### Backend (Render) - 5 Steps

1. ✅ **MongoDB Atlas Setup**
   - Sign up: https://www.mongodb.com/cloud/atlas
   - Create M0 FREE cluster
   - Create database user
   - Whitelist IP: `0.0.0.0/0`
   - Copy connection string

2. ✅ **Render Setup**
   - Sign up: https://render.com
   - New Web Service → Connect GitHub
   - Repository: `Matizkim/AGRIPULSE`
   - Root Directory: `agripulse-backend`
   - Build: `npm install`
   - Start: `npm start`

3. ✅ **Environment Variables (Render)**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<your_mongodb_connection_string>
   CLERK_SECRET_KEY=<your_clerk_secret>
   AT_USERNAME=sandbox
   AT_API_KEY=<your_at_key>
   AT_SENDER_NAME=AgriPulse
   ```

4. ✅ **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes
   - Get URL: `https://your-backend.onrender.com`

5. ✅ **Test**
   - Visit: `https://your-backend.onrender.com/health`
   - Should see: `{"ok":true}`

---

### Frontend (Vercel) - 4 Steps

1. ✅ **Vercel Setup**
   - Sign up: https://vercel.com
   - Import Project → GitHub
   - Repository: `Matizkim/AGRIPULSE`
   - Root Directory: `agripulse-frontend`
   - Framework: Vite

2. ✅ **Environment Variables (Vercel)**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   VITE_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
   ```

3. ✅ **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get URL: `https://your-frontend.vercel.app`

4. ✅ **Update Backend CORS**
   - Render Dashboard → Environment
   - Add: `CORS_ORIGIN=https://your-frontend.vercel.app`

---

## 🔗 Important URLs

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com

---

## 🐛 Quick Fixes

### Backend won't start
```bash
# Check Render logs
# Verify PORT=10000 is set
# Check MongoDB connection string
```

### Frontend can't connect to backend
```bash
# Verify VITE_API_URL is correct
# Check CORS_ORIGIN in backend
# Ensure backend is running
```

### MongoDB connection fails
```bash
# Verify connection string
# Check IP whitelist (0.0.0.0/0)
# Verify database user credentials
```

---

## 📝 Environment Variables Cheat Sheet

### Backend (.env on Render)
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/agripulse
CLERK_SECRET_KEY=sk_live_xxxxx
AT_USERNAME=sandbox
AT_API_KEY=xxxxx
AT_SENDER_NAME=AgriPulse
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend (.env on Vercel)
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend health check works
- [ ] Frontend loads correctly
- [ ] Authentication works
- [ ] API calls succeed
- [ ] Socket.IO connects
- [ ] No CORS errors
- [ ] Environment variables set
- [ ] Custom domain (optional)

---

**Total Cost: $0/month** 🎉

For detailed instructions, see `DEPLOYMENT_GUIDE.md`

