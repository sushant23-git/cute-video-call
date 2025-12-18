# 🚀 Deployment Guide

This guide will help you deploy your Cute Video Call app to the internet!

## 📋 Prerequisites

Before deploying, make sure you have:
- ✅ A GitHub account (to store your code)
- ✅ Git installed on your computer
- ✅ Your code ready (already done!)

---

## Option 1: Deploy to Render (Recommended - FREE)

### Step 1: Push Code to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   cd "c:\Users\sushant gajbhiye\Desktop\projrcts\vc prototype"
   git init
   git add .
   git commit -m "Initial commit - Cute Video Call MVP"
   ```

2. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Name it: `cute-video-call`
   - Don't initialize with README (we already have files)
   - Click "Create repository"

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/cute-video-call.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Render

1. **Go to Render**: https://render.com
2. **Sign up** with your GitHub account
3. **Click "New +"** → **"Web Service"**
4. **Connect your repository**: `cute-video-call`
5. **Configure**:
   - **Name**: `cute-video-call` (or any name you like)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
6. **Click "Create Web Service"**
7. **Wait 2-5 minutes** for deployment to complete
8. **Your app will be live** at: `https://cute-video-call.onrender.com` (or your chosen name)

🎉 **Done!** Share your URL with friends!

---

## Option 2: Deploy to Railway (Also FREE Trial)

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy on Railway

1. **Go to Railway**: https://railway.app
2. **Sign up** with GitHub
3. **Click "New Project"** → **"Deploy from GitHub repo"**
4. **Select** your `cute-video-call` repository
5. **Railway auto-detects** Node.js and deploys automatically
6. **Click "Generate Domain"** to get a public URL
7. **Your app is live!**

---

## Option 3: Deploy to Heroku (Paid)

### Step 1: Install Heroku CLI

Download from: https://devcenter.heroku.com/articles/heroku-cli

### Step 2: Deploy

```bash
cd "c:\Users\sushant gajbhiye\Desktop\projrcts\vc prototype"
heroku login
heroku create cute-video-call
git push heroku main
heroku open
```

---

## 🔧 Post-Deployment Configuration

### Important: WebRTC Connectivity

For better connectivity across different networks, consider adding TURN servers:

1. **Get free TURN servers** from:
   - https://www.metered.ca/tools/openrelay/
   - Or use Twilio TURN (free tier available)

2. **Update `public/js/room.js`** line 13-18:
   ```javascript
   const configuration = {
     iceServers: [
       { urls: 'stun:stun.l.google.com:19302' },
       { urls: 'stun:stun1.l.google.com:19302' },
       // Add TURN servers here for better connectivity
       {
         urls: 'turn:your-turn-server.com:3478',
         username: 'your-username',
         credential: 'your-password'
       }
     ]
   };
   ```

---

## 🧪 Testing Your Deployed App

1. **Open your deployed URL** in a browser
2. **Open another tab** (or use a different device)
3. **Both users join the same room code**
4. **Verify video/audio works**

---

## 🐛 Troubleshooting

### App won't start
- Check logs on your hosting platform
- Verify `package.json` has correct start script
- Ensure all dependencies are listed

### WebSocket connection fails
- Make sure your hosting platform supports WebSockets
- Render and Railway support it by default ✅

### Video/audio not working
- HTTPS is required for WebRTC (hosting platforms provide this automatically)
- Check browser permissions for camera/mic
- Consider adding TURN servers for better connectivity

---

## 📊 Monitoring

### Render
- View logs: Dashboard → Your Service → Logs
- View metrics: Dashboard → Your Service → Metrics

### Railway
- View logs: Project → Deployments → Logs
- View metrics: Project → Metrics

---

## 💰 Cost Estimates

| Platform | Free Tier | Limitations |
|----------|-----------|-------------|
| **Render** | ✅ Yes | Sleeps after 15 min inactivity, 750 hours/month |
| **Railway** | ✅ Trial | $5 free credit, then pay-as-you-go |
| **Heroku** | ❌ No | Starts at $7/month |

**Recommendation**: Start with **Render's free tier**!

---

## 🎯 Quick Start (TL;DR)

1. Push code to GitHub
2. Sign up on Render.com
3. Connect GitHub repo
4. Click deploy
5. Share your URL! 🎉

---

## 📞 Need Help?

If you run into issues:
1. Check the hosting platform's documentation
2. Review the logs for error messages
3. Ensure all files are committed to Git
4. Verify `package.json` has the correct dependencies

---

**Good luck with your deployment! 🎀✨**
