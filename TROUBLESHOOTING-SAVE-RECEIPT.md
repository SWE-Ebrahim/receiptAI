# Troubleshooting "Failed to Save Receipt" Error

## ✅ Current Status

- ✅ All API URLs use environment variables
- ✅ `scanApi.ts` has `API_BASE` with `VITE_API_URL`
- ✅ Backend is live at: `https://receiptai-backend-rgf8.onrender.com`
- ✅ Code pushed to GitHub

---

## 🔍 Most Likely Causes

### **Issue 1: Vercel Environment Variable Not Set** ⚠️ MOST COMMON

**Check:**
1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Environment Variables**
3. Look for `VITE_API_URL`

**If Missing, Add It:**
```
Key: VITE_API_URL
Value: https://receiptai-backend-rgf8.onrender.com/api
Environment: Production, Preview, Development (select all)
```

**After Adding:**
- Click **Save**
- Go to **Deployments** tab
- Click latest deployment → **Redeploy** (top right)
- Wait 1-2 minutes for rebuild

---

### **Issue 2: Backend Sleeping (Render Free Tier)**

Render free tier sleeps after 15 minutes of inactivity.

**Solution:**
1. First request after sleep takes 30-60 seconds
2. Try saving again after waiting
3. Set up free uptime monitor:
   - UptimeRobot: https://uptimerobot.com
   - Ping every 10 min: `https://receiptai-backend-rgf8.onrender.com/health`

---

### **Issue 3: Authentication Token Missing**

**Check Browser Console (F12):**
Look for errors like:
- "Authentication required"
- "401 Unauthorized"
- "Token expired"

**Solution:**
1. Logout and login again
2. Check if token exists: Open console, type `localStorage.getItem('authToken')`
3. If null, re-login

---

### **Issue 4: Category Not Selected**

The system requires a category to be selected before saving.

**Check:**
- Make sure you selected a category from the dropdown
- Category should appear in the form before clicking "Save Receipt"

---

### **Issue 5: Backend Error**

**Check Backend Logs:**
1. Go to Render Dashboard
2. Select your backend service
3. Click **Logs** tab
4. Try saving a receipt
5. Watch for error messages

Common backend errors:
- Database connection issues
- File upload errors
- Missing environment variables on backend

---

## 🛠️ Debugging Steps

### **Step 1: Check Browser Console**

1. Open your app in browser
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Try to save a receipt
5. Look for error messages

Expected logs if working:
```
💾 Sending receipt to backend: {...}
✅ Receipt saved to database: {...}
```

Error logs if failing:
```
❌ Save receipt error: TypeError: Failed to fetch
```

---

### **Step 2: Test Backend Directly**

Open browser and test:
```
https://receiptai-backend-rgf8.onrender.com/health
```

Should return:
```json
{
  "status": "OK",
  "message": "receiptAI backend is running!"
}
```

---

### **Step 3: Check Network Tab**

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to save a receipt
4. Look for the POST request to `/api/receipts/upload`
5. Check:
   - Status code (should be 200 or 201)
   - Response body
   - Request headers (should have Authorization)

---

### **Step 4: Verify Environment Variable in Build**

After Vercel deploys, check if the env var was used:

1. Go to Vercel Dashboard
2. Click latest deployment
3. Click **Build Logs**
4. Search for "VITE_API_URL"
5. Should see it being loaded

---

## 💡 Quick Fixes

### **Fix 1: Hard Refresh**
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### **Fix 2: Clear Cache and Reload**
```
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
```

### **Fix 3: Try Incognito Mode**
Open your app in incognito/private window to rule out cache issues.

---

## 📋 Checklist

Before reporting the issue, verify:

- [ ] VITE_API_URL is set in Vercel environment variables
- [ ] Backend is responding at `/health` endpoint
- [ ] You're logged in (token exists in localStorage)
- [ ] Category is selected before saving
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows POST request to correct URL
- [ ] Vercel deployment completed successfully
- [ ] Hard refreshed the browser

---

## 🎯 Most Common Solution

90% of "Failed to fetch" or "Failed to save" errors are caused by:

1. **Missing VITE_API_URL in Vercel** → Add it and redeploy
2. **Backend sleeping** → Wait 30 seconds and try again
3. **Browser cache** → Hard refresh (Ctrl+Shift+R)

---

## 📞 If Still Not Working

Share these details:
1. Exact error message from browser console
2. Network tab screenshot showing the failed request
3. Vercel deployment status (successful/failed)
4. Backend logs from Render dashboard
