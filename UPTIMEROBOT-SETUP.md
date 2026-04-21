# UptimeRobot Setup - Keep Backend Awake

## Overview
Render.com free tier puts your backend to sleep after 15 minutes of inactivity. UptimeRobot will ping your backend every 5 minutes to keep it awake.

**⏰ Setup Time:** 5 minutes  
**💰 Cost:** $0 (Free forever)  
**💳 Credit Card:** Not required

---

## Step-by-Step Setup

### 1. Sign Up for UptimeRobot
1. Go to: https://uptimerobot.com
2. Click **"Sign Up Free"** (top right)
3. Create account with email (no credit card needed)
4. Verify your email

### 2. Add Your Backend Monitor
1. After login, click **"Add New Monitor"** (green button)
2. Configure:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** `ReceiptAI Backend`
   - **URL or IP:** Your Render backend URL  
     Example: `https://receipt-ai-api.onrender.com`
   - **Monitoring Interval:** 5 minutes (free tier limit)
3. Click **"Create Monitor"**

### 3. Verify Monitor is Working
1. Wait 5-10 minutes
2. Check UptimeRobot dashboard
3. You should see green status
4. Your backend will now stay awake 24/7!

---

## Your Backend URLs

Replace with your actual Render URL:

| Service | URL |
|---------|-----|
| **Backend API** | `https://YOUR-APP-NAME.onrender.com` |
| **Frontend** | `https://YOUR-APP-NAME.vercel.app` |

**To find your backend URL:**
1. Go to https://dashboard.render.com
2. Click your backend service
3. Copy the URL (ends with `.onrender.com`)

---

## What UptimeRobot Does

✅ **Pings backend every 5 minutes**  
✅ **Prevents Render sleep mode**  
✅ **Instant login (no 2-minute wait)**  
✅ **Instant scan responses**  
✅ **Free forever**  
✅ **Email alerts if backend goes down**

---

## Expected Performance After Setup

| Action | Before | After |
|--------|--------|-------|
| Login | 2 minutes | 2-3 seconds |
| Scan receipt | 3 minutes | 3-5 seconds |
| Load history | 10 seconds | 1-2 seconds |
| Dashboard load | 5 seconds | 1 second |

---

## Troubleshooting

### Monitor Shows "Down"
- **Cause:** Backend might be deploying
- **Solution:** Wait 2-3 minutes for deployment to complete

### Backend Still Slow
- **Cause:** First request after deployment
- **Solution:** Wait for cold start (10-30 seconds), then it's fast

### Monitor URL Wrong
- **Cause:** Incorrect Render URL
- **Solution:** Double-check your backend URL in Render dashboard

---

## Pro Tips

1. **Check uptime stats** - UptimeRobot shows monthly uptime %
2. **Set up alerts** - Get email if backend goes down
3. **Multiple monitors** - Can monitor frontend too
4. **Mobile app** - Download UptimeRobot app for notifications

---

## Need Help?

If backend is still slow after UptimeRobot setup:
1. Check Render logs for errors
2. Verify database indexes are created
3. Clear browser cache
4. Check Vercel deployment is successful

---

**🚀 Setup UptimeRobot and enjoy blazing-fast performance!**
