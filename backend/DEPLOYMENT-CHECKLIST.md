# Backend Deployment Checklist for Render.com

## ✅ Pre-Deployment Fixes Applied

### Fixed Issues:
1. ✅ Created missing `.gitkeep` files in empty directories
   - `src/uploads/.gitkeep`
   - `src/logs/.gitkeep`
   - `src/temp/.gitkeep`
   - `src/cache/.gitkeep`

2. ✅ Moved `morgan` from devDependencies to dependencies
   - Required for production logging

3. ✅ Updated `render.yaml` configuration
   - Added `rootDir: backend`
   - Added `SUPABASE_ANON_KEY` env var
   - Removed unused `OCR_SPACE_API_KEY`

---

## 📋 Environment Variables Needed on Render.com

Copy these from your local `.env` file and add them to Render dashboard:

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=your_jwt_secret_min_32_chars
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password_16_chars
```

### How to Get These Values:

**Supabase Credentials:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `SUPABASE_URL`
   - anon public key → `SUPABASE_ANON_KEY`
   - service_role key (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

**Gmail App Password:**
1. Enable 2-Factor Authentication on Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Generate app password for "Mail"
4. Copy the 16-character password → `EMAIL_PASS`
5. Your Gmail address → `EMAIL_USER`

**JWT Secret:**
- Generate a random string (min 32 characters)
- Example: `openssl rand -hex 32`
- Or use: https://generate-secret.vercel.app/32

---

## 🚀 Deployment Steps

### Step 1: Push Code to GitHub
```bash
cd d:/Projects/receiptAI
git add .
git commit -m "fix: prepare backend for Render deployment

- Added .gitkeep files for empty directories
- Moved morgan to dependencies
- Updated render.yaml configuration
- Ready for production deployment"
git push origin main
```

### Step 2: Deploy on Render.com

1. **Sign up/Login**: https://render.com
2. **Click**: New + → Web Service
3. **Connect Repository**: Select your GitHub repo
4. **Configure Service**:
   - **Name**: `receiptai-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. **Add Environment Variables**:
   - Click "Advanced" → "Add Environment Variable"
   - Add all 7 variables listed above
   - Make sure values are correct (no extra spaces)

6. **Click**: Create Web Service

### Step 3: Wait for Deployment
- Initial build: 2-5 minutes
- Watch the logs for errors
- Look for: "✅ Server running on port 10000"

### Step 4: Test Deployment
Once deployed, test these endpoints:

1. **Health Check**:
   ```
   https://receiptai-backend.onrender.com/health
   ```
   Expected: `{"status":"OK","message":"receiptAI backend is running!"}`

2. **Database Test**:
   ```
   https://receiptai-backend.onrender.com/test-db
   ```
   Expected: All tables accessible

---

## ⚠️ Common Issues & Solutions

### Issue 1: Build Fails - "Module not found"
**Solution**: Ensure all dependencies are in `package.json`
```bash
cd backend
npm install
git add package-lock.json
git commit -m "update dependencies"
git push
```

### Issue 2: Database Connection Failed
**Solution**: 
- Verify Supabase credentials are correct
- Check Supabase project is active
- Ensure no IP restrictions on Supabase

### Issue 3: Email Not Sending
**Solution**:
- Use Gmail App Password (NOT regular password)
- Enable 2FA on Google account first
- Verify EMAIL_USER is correct Gmail address

### Issue 4: Port Error
**Solution**: Render sets PORT automatically, but our code handles it:
```javascript
const PORT = process.env.PORT || 5000;
```
This is already configured correctly.

### Issue 5: CORS Errors from Frontend
**Solution**: Our server.js already has:
```javascript
app.use(cors());
```
This allows all origins. For production, you can restrict it later.

---

## 🔍 Post-Deployment Verification

### Test Checklist:
- [ ] Health endpoint responds: `/health`
- [ ] Database test passes: `/test-db`
- [ ] Can signup new user
- [ ] OTP email received
- [ ] Can login successfully
- [ ] Can upload receipt image
- [ ] OCR processing works
- [ ] Can view receipt history
- [ ] PDF export works
- [ ] Category management works

### Monitor Logs:
- Go to Render Dashboard → Your Service → Logs
- Watch for errors in real-time
- Check for successful database connections
- Verify email sending works

---

## 💰 Free Tier Limits (Render.com)

- **Sleep after 15 minutes** of inactivity
- **First request after sleep**: 30-60 seconds delay
- **750 hours/month** free (enough for always-on if single service)
- **100 GB bandwidth/month**
- **No custom domain** on free tier (uses `.onrender.com`)

### Keep Service Awake:
Use a free uptime monitor to ping your backend every 10 minutes:
- UptimeRobot: https://uptimerobot.com
- Cron-job.org: https://cron-job.org
- Ping every 10 min to: `https://receiptai-backend.onrender.com/health`

---

## 🎯 Next Steps After Backend Deployed

1. **Get your backend URL**: `https://receiptai-backend.onrender.com`
2. **Update frontend**: Create `.env.production` with this URL
3. **Deploy frontend** to Vercel
4. **Test full flow**: Signup → Scan → Save → Export

---

## 📞 Support

If deployment fails:
1. Check Render logs for specific error messages
2. Verify all environment variables are set
3. Test locally first: `npm start` in backend folder
4. Check Supabase dashboard for connection issues

**Your backend is NOW READY for deployment!** 🚀
