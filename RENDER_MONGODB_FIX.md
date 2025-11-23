# 🔧 Fix MongoDB Connection Error on Render

## Error Message
```
MongoDB connection error: MongoAPIError: URI must include hostname, domain name, and tld
```

## 🎯 Quick Fix

The `MONGODB_URI` environment variable is either missing or incorrectly set in Render.

### Step 1: Get Your MongoDB Connection String

1. **Go to MongoDB Atlas**
   - Visit: https://cloud.mongodb.com
   - Login to your account

2. **Get Connection String**
   - Click "Database" → Your cluster
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It should look like:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

3. **Replace Placeholders**
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Add database name at the end: `/agripulse`
   
   **Final format:**
   ```
   mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/agripulse?retryWrites=true&w=majority
   ```

### Step 2: Add to Render Environment Variables

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click on your `agripulse-backend` service

2. **Navigate to Environment**
   - Click "Environment" in the left sidebar
   - Or click "Environment Variables" tab

3. **Add/Update MONGODB_URI**
   - Click "Add Environment Variable" (if not exists)
   - Or click on existing `MONGODB_URI` to edit
   - **Key**: `MONGODB_URI`
   - **Value**: Paste your complete connection string
   - Click "Save Changes"

4. **Verify Format**
   - Should start with `mongodb+srv://`
   - Should include username and password
   - Should include cluster hostname
   - Should end with database name: `/agripulse`

### Step 3: Redeploy

1. **Manual Redeploy**
   - In Render dashboard, click "Manual Deploy"
   - Select "Deploy latest commit"
   - Wait for deployment to complete

2. **Or Push to GitHub**
   - Make any small change and push to GitHub
   - Render will auto-deploy

### Step 4: Check Logs

1. **View Logs**
   - In Render dashboard, click "Logs"
   - Look for: `✅ MongoDB connected successfully`
   - If you see errors, check the troubleshooting section below

## ✅ Expected Success Output

After fixing, you should see:
```
🔍 Environment Check:
  ✓ PORT: 10000
  ✓ NODE_ENV: production
  ✓ MONGODB_URI: Set ✓
  ✓ AT_USERNAME: sandbox
  ✓ AT_API_KEY: Set ✓

🔄 Connecting to MongoDB...
✅ MongoDB connected successfully
🚀 Server running on port 10000
```

## 🐛 Troubleshooting

### Issue: Still getting connection error

**Check 1: MongoDB Atlas IP Whitelist**
- Go to MongoDB Atlas → Network Access
- Ensure `0.0.0.0/0` is whitelisted (allows all IPs)
- Or add Render's IP addresses

**Check 2: Database User Credentials**
- Go to MongoDB Atlas → Database Access
- Verify username and password are correct
- Ensure user has "Read and write to any database" permission

**Check 3: Connection String Format**
- Must start with `mongodb+srv://` (for Atlas)
- Format: `mongodb+srv://username:password@cluster.mongodb.net/database`
- No spaces or special characters (except in password)
- URL-encode special characters in password if needed

**Check 4: Database Name**
- Ensure database name is included: `/agripulse`
- Or use: `/?retryWrites=true&w=majority&appName=agripulse`

### Issue: "Authentication failed"

- Verify database username and password
- Check if user has correct permissions
- Try creating a new database user

### Issue: "IP not whitelisted"

- Go to MongoDB Atlas → Network Access
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (0.0.0.0/0)
- Wait 1-2 minutes for changes to propagate

## 📝 Example Connection String

**Correct Format:**
```
mongodb+srv://agripulse_user:MySecurePassword123@cluster0.abc123.mongodb.net/agripulse?retryWrites=true&w=majority
```

**Breakdown:**
- `mongodb+srv://` - Protocol
- `agripulse_user` - Username
- `MySecurePassword123` - Password
- `cluster0.abc123.mongodb.net` - Cluster hostname
- `agripulse` - Database name
- `?retryWrites=true&w=majority` - Connection options

## 🔒 Security Note

- Never commit connection strings to GitHub
- Always use environment variables
- Use strong passwords for database users
- Regularly rotate credentials

## 📞 Still Having Issues?

1. Check Render logs for detailed error messages
2. Verify MongoDB Atlas cluster is running
3. Test connection string locally first
4. Check MongoDB Atlas status page

---

**After fixing, your app should deploy successfully! 🎉**

