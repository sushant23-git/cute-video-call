# 🎀 Cute Video Call - Supabase Setup Guide

## Prerequisites

You need a **Supabase account** and project. If you don't have one:
1. Go to https://supabase.com
2. Sign up for a free account
3. Create a new project

---

## Step 1: Set Up Supabase Database

### 1.1 Run the SQL Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-setup.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the script

This will create:
- `user_profiles` table
- `rooms` table  
- `room_participants` table
- Row-level security (RLS) policies
- Automated triggers for user profiles

### 1.2 Verify Tables Were Created

1. Go to **Table Editor** in the left sidebar
2. You should see three new tables:
   - `user_profiles`
   - `rooms`
   - `room_participants`

---

## Step 2: Get Your Supabase API Keys

1. In your Supabase project, go to **Settings** → **API**
2. You'll find two important keys:
   - **Project URL**: Looks like `https://xxxxx.supabase.co`
   - **anon/public key**: A long string starting with `eyJ...`
   - **service_role key**: Another long string (keep this secret!)

---

## Step 3: Configure Environment Variables

### 3.1 Create `.env` File

1. In your project root directory (where `server.js` is located)
2. Copy `.env.example` to create `.env`:
   ```bash
   cp .env.example .env
   ```

### 3.2 Add Your Supabase Credentials

Open `.env` and replace the placeholder values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
```

### 3.3 Update Client-Side Credentials

Open `public/js/auth.js` and update lines 5-6:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

> ⚠️ **Important**: Only use the `anon` key in client-side code, never the `service_role` key!

---

## Step 4: Configure Supabase Authentication

### 4.1 Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Scroll down to **Email Templates**
4. Optionally customize the confirmation email template

### 4.2 Disable Email Confirmation (Optional, for Development)

For easier testing during development:

1. Go to **Authentication** → **Settings**
2. Find **Enable email confirmations**
3. Toggle it **OFF** for development
4. Remember to turn it back **ON** for production!

---

## Step 5: Run the Application

### 5.1 Install Dependencies

```bash
npm install
```

### 5.2 Start the Server

```bash
npm start
```

You should see:
```
✅ Supabase initialized
🎀 Cute Video Call Server running on http://localhost:3000
```

If Supabase credentials are missing, you'll see:
```
⚠️  Supabase credentials not found in environment variables
    The app will work but without database persistence
```

---

## Step 6: Test the Application

### 6.1 Create an Account

1. Open http://localhost:3000 in your browser
2. You should see the **Sign Up** tab
3. Fill in:
   - Email
   - Password (min 6 characters)
   - Username
   - Choose an avatar
4. Click **Sign Up**

### 6.2 Verify User Creation

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Users**
3. You should see your new user
4. Go to **Table Editor** → **user_profiles**
5. You should see a profile entry with your username and avatar

### 6.3 Join a Video Call

1. After logging in, you'll see the **Join a Room** section
2. Enter a room code (e.g., "test123")
3. Click **Join Room**
4. Grant camera and microphone permissions when prompted

### 6.4 Test with Multiple Users

1. Open another browser (or incognito window)
2. Go to http://localhost:3000
3. Create a different account
4. Join the same room code
5. You should see both video streams!

### 6.5 Verify Database Tracking

1. In Supabase dashboard, go to **Table Editor** → **rooms**
2. You should see your room with the code you entered
3. Go to **room_participants**
4. You should see entries for each user who joined

---

## Troubleshooting

### "Please login first! 🔒" Alert

- This means authentication failed
- Check that your Supabase credentials are correct in both `.env` and `auth.js`
- Make sure you've signed up and logged in

### "Failed to create room" Error

- Check your browser console for errors
- Verify the SQL schema was run correctly in Step 1
- Check RLS policies are enabled on all tables

### Video/Audio Not Working

- Make sure you granted browser permissions for camera and microphone
- Try a different browser (Chrome/Edge recommended)
- Check that you're using HTTPS or localhost (WebRTC requirement)

### Database Queries Failing

- Check RLS policies are properly set up
- User must be authenticated to interact with database
- Check browser console for Supabase error messages

---

## Production Deployment

### Security Checklist

- [ ] Enable email confirmation in Supabase Auth settings
- [ ] Use HTTPS for your domain
- [ ] Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- [ ] Set strong password requirements
- [ ] Configure CORS settings in Supabase
- [ ] Review and test all RLS policies

### Environment Variables

Make sure to set these on your hosting platform:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT` (if different from 3000)

---

## Features Implemented

✅ User authentication (signup/login)  
✅ User profiles with avatars  
✅ Room creation and persistence  
✅ Participant tracking with join/leave timestamps  
✅ Row-level security for data protection  
✅ WebRTC video calling (peer-to-peer)  
✅ Socket.IO signaling for WebRTC  
✅ Real-time presence tracking  

---

## Need Help?

- Supabase Documentation: https://supabase.com/docs
- WebRTC Documentation: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- Socket.IO Documentation: https://socket.io/docs/

Enjoy your cute video calls! ✨💖
