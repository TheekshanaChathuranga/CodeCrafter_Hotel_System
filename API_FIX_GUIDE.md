# 🔧 API Connection Issue Fix Guide

## Problem
You're getting a **404 error** when trying to fetch bookings from the API endpoint `/api/receptionBookings`.

## Root Cause
The backend server is either:
1. **Not running** 
2. **Running on a different port**
3. **Missing the required routes**
4. **Has database connection issues**

## 🚀 Quick Fix Steps

### Step 1: Start the Backend Server
1. **Double-click** `start-backend.bat` in the project root folder
2. **OR** manually run:
   ```bash
   cd Backend
   npm install
   npm start
   ```
3. Look for this message: `Server running on port 5000`
4. Ensure you see: `Connected to MongoDB`

### Step 2: Verify Server is Running
1. Open your browser
2. Go to: http://localhost:5000/api/health
3. You should see: `{"status":"OK","dbState":1,"message":"Server is running"}`

### Step 3: Test API Endpoints
Test these URLs in your browser:
- http://localhost:5000/api/health ✅ Should work
- http://localhost:5000/api/receptionBookings ✅ Should return bookings or empty array

### Step 4: Start Frontend (if not already running)
1. **Double-click** `start-frontend.bat` 
2. **OR** manually run:
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

## 🔍 Troubleshooting

### If Backend Won't Start:
1. **Check Node.js**: Run `node --version` in command prompt
2. **Install dependencies**: 
   ```bash
   cd Backend
   npm install
   ```
3. **Check MongoDB**: Ensure MongoDB URI is set in environment variables
4. **Check port 5000**: Make sure nothing else is using port 5000

### If Still Getting 404 Errors:
1. **Clear browser cache**
2. **Restart both servers**
3. **Check console for detailed errors**

### If Database Issues:
1. Verify MongoDB connection string in `.env` file
2. Ensure MongoDB is running
3. Check database permissions

## 🛠️ Enhanced Error Handling

The API has been updated with:
- **Automatic fallback endpoints**
- **Better error messages**
- **Connection testing**
- **Local data calculation** when server is unavailable

## 📱 Features Still Available Without Backend:
- Basic dashboard layout
- Sample room availability data
- Calendar navigation
- UI interactions

## 🆘 If Problems Persist:

1. **Check the console** for detailed error messages
2. **Verify file structure** matches the expected layout
3. **Ensure all dependencies** are installed
4. **Check firewall/antivirus** isn't blocking connections

## 📋 Server Status Checklist:
- [ ] Node.js installed and working
- [ ] Backend dependencies installed (`npm install`)
- [ ] MongoDB connection working
- [ ] Backend server running on port 5000
- [ ] Health endpoint accessible
- [ ] Frontend server running
- [ ] No CORS errors in browser console

## 🔄 Recovery Commands:

If everything fails, try these recovery steps:

```bash
# Stop all Node processes
taskkill /f /im node.exe

# Reinstall backend
cd Backend
rmdir /s node_modules
npm install
npm start

# In a new terminal, reinstall frontend
cd Frontend
rmdir /s node_modules
npm install
npm run dev
```

The enhanced API now includes automatic fallbacks, so the dashboard should work even if some endpoints are unavailable!
