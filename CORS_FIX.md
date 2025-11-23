# 🔧 Fix CORS Error - Render & Vercel

## Error Message
```
Access to XMLHttpRequest at 'https://agripulse-backend-kbit.onrender.com/api/demand' 
from origin 'https://agripulse-lilac.vercel.app' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🎯 Quick Fix (2 Steps)

### Step 1: Add CORS_ORIGIN to Render Environment Variables

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click on your `agripulse-backend` service
   - Click "Environment" in the left sidebar

2. **Add Environment Variable**
   - Click "Add Environment Variable"
   - **Key**: `CORS_ORIGIN`
   - **Value**: `https://agripulse-lilac.vercel.app`
   - Click "Save Changes"

   **If you have multiple origins (e.g., custom domain), separate with commas:**
   ```
   https://agripulse-lilac.vercel.app,https://your-custom-domain.com
   ```

### Step 2: Redeploy

1. **Manual Redeploy**
   - In Render dashboard, click "Manual Deploy"
   - Select "Deploy latest commit"
   - Wait for deployment (2-3 minutes)

2. **Or Push to GitHub**
   - Make any small change and push
   - Render will auto-deploy

## ✅ Expected Result

After fixing, you should see in Render logs:
```
🔍 Environment Check:
  ✓ CORS_ORIGIN: https://agripulse-lilac.vercel.app
```

And your frontend should be able to make API calls successfully!

## 🔍 Verify It's Working

1. **Check Render Logs**
   - Look for: `🌐 CORS Check - Origin: https://agripulse-lilac.vercel.app`
   - Should show: `✓ CORS_ORIGIN: https://agripulse-lilac.vercel.app`

2. **Test in Browser**
   - Open your Vercel app: https://agripulse-lilac.vercel.app
   - Try creating a demand or produce listing
   - Should work without CORS errors

## 📝 Environment Variable Format

### Single Origin
```
CORS_ORIGIN=https://agripulse-lilac.vercel.app
```

### Multiple Origins (comma-separated)
```
CORS_ORIGIN=https://agripulse-lilac.vercel.app,https://www.agripulse.com,https://agripulse.netlify.app
```

**Important:**
- No spaces after commas
- Include `https://` protocol
- No trailing slashes

## 🐛 Troubleshooting

### Issue: Still getting CORS errors

**Check 1: Environment Variable is Set**
- Go to Render → Environment
- Verify `CORS_ORIGIN` exists and has correct value
- Check for typos (https vs http, trailing slashes)

**Check 2: Redeploy After Adding Variable**
- Environment variables require a redeploy to take effect
- Click "Manual Deploy" after adding/updating

**Check 3: Check Render Logs**
- Look for CORS-related log messages
- Check if origin is being blocked

**Check 4: Verify Frontend URL**
- Make sure `CORS_ORIGIN` matches your exact Vercel URL
- Check for typos: `agripulse-lilac.vercel.app` (not `agripulse-lilac.vercel.com`)

### Issue: Works in dev but not production

- Development allows all origins
- Production requires `CORS_ORIGIN` to be set
- Make sure it's set in Render environment variables

### Issue: Multiple Vercel deployments

If you have multiple Vercel deployments (preview, production):
```
CORS_ORIGIN=https://agripulse-lilac.vercel.app,https://agripulse-lilac-git-main.vercel.app
```

Or use wildcard (if supported by your CORS config):
```
CORS_ORIGIN=https://*.vercel.app
```

## 🔒 Security Note

- **Development**: Allows all origins (for easy testing)
- **Production**: Only allows origins specified in `CORS_ORIGIN`
- Always set `CORS_ORIGIN` in production for security

## 📋 Complete Environment Variables Checklist

Make sure these are set in Render:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
CLERK_SECRET_KEY=sk_live_...
AT_USERNAME=sandbox
AT_API_KEY=...
AT_SENDER_NAME=AgriPulse
CORS_ORIGIN=https://agripulse-lilac.vercel.app  ← ADD THIS!
```

## 🎉 After Fixing

Your API calls should work:
- ✅ GET /api/demand
- ✅ POST /api/demand
- ✅ GET /api/produce
- ✅ POST /api/produce
- ✅ GET /api/match
- ✅ POST /api/match

---

**Quick Fix Summary:**
1. Add `CORS_ORIGIN=https://agripulse-lilac.vercel.app` to Render
2. Redeploy
3. Test your app!

**That's it! 🚀**

