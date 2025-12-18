# 🎀 Cute Video Call

A delightful browser-based video calling application with a kawaii-inspired aesthetic! Connect with friends using custom room codes - no signup required! 💖✨

![Cute Video Call](https://img.shields.io/badge/WebRTC-Enabled-pink?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-Express-mint?style=for-the-badge)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-lavender?style=for-the-badge)

## ✨ Features

- 🎥 **Real-time Video Calling** - WebRTC peer-to-peer video and audio
- 🏠 **Custom Room Codes** - Create or join rooms with any code you like
- 👤 **No Authentication** - Jump right in, no signup needed
- 🎨 **Cute Avatars** - Choose from 6 adorable emoji avatars
- 🎤 **Media Controls** - Mute mic and toggle camera on/off
- 💖 **Kawaii Aesthetic** - Bubblegum pink, mint green, and soft pastels
- 📱 **Responsive Design** - Works on desktop and mobile browsers

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd "c:\Users\sushant gajbhiye\Desktop\projrcts\vc prototype"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 🎮 How to Use

### Starting a Video Call

1. **Enter your name** - Pick a cute username! 💖
2. **Enter a room code** - Create a new code or use an existing one (e.g., "cutie123")
3. **Choose your avatar** - Select from 🐱 Cat, 🐰 Bunny, 🐻 Bear, 🐼 Panda, 🦊 Fox, or ⭐ Star
4. **Click "Join Room"** - Allow camera and microphone access when prompted

### Inviting Friends

Share your room code with friends! They can:
1. Go to `http://localhost:3000` (or your server's URL)
2. Enter their own username
3. Enter the **same room code** you're using
4. Join and start chatting!

### During the Call

- **🎤 Mic On/Off** - Click to mute or unmute your microphone
- **📹 Camera On/Off** - Click to turn your camera on or off
- **👋 Leave Room** - Click to exit the call and return to the home page

## 🎨 Design

The application features a **kawaii-inspired aesthetic** with:
- Soft pastel color palette (bubblegum pink, mint green, peach, lavender)
- Rounded corners and dashed borders (scrapbook style)
- Floating blob animations in the background
- Smooth hover effects and transitions
- Friendly Quicksand typography

## 🏗️ Technical Stack

- **Backend**: Node.js + Express + Socket.IO
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **WebRTC**: Peer-to-peer video/audio streaming
- **Signaling**: WebSocket-based (Socket.IO)

## 📁 Project Structure

```
vc prototype/
├── server.js              # Signaling server
├── package.json           # Dependencies
├── README.md             # This file
└── public/
    ├── index.html         # Landing page
    ├── room.html          # Video call room
    ├── css/
    │   └── style.css      # Kawaii-themed styles
    └── js/
        ├── main.js        # Landing page logic
        └── room.js        # WebRTC client
```

## 🧪 Testing Multi-User Calls

To test with multiple users on the same computer:

1. Open multiple browser tabs or windows
2. In each tab, enter a different username
3. Use the **same room code** in all tabs
4. Each tab will show all participants' video feeds

**Tip**: Use incognito/private windows to simulate different users more realistically!

## 🌐 Browser Compatibility

Tested and working on:
- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Microsoft Edge
- ✅ Safari (with WebRTC support)

## 🔒 Privacy & Security

- **No data storage** - No user data is saved to a database
- **Peer-to-peer** - Video/audio streams directly between users
- **Temporary sessions** - All data cleared when you leave
- **No authentication** - No passwords or personal info required

> **Note**: This is an MVP without TURN servers, so it may not work across some restrictive firewalls or NATs. For production use, consider adding TURN server support.

## 🎯 MVP Scope

This is a **Minimum Viable Product** with the following intentional limitations:
- No text chat feature
- No screen sharing
- No recording capability
- No user moderation tools
- No persistent room history
- Basic WebRTC setup (STUN only, no TURN)

## 🛠️ Troubleshooting

### Camera/Microphone Not Working
- Check browser permissions (allow camera and mic access)
- Ensure no other application is using your camera
- Try refreshing the page

### Can't See Other Users
- Verify you're using the **same room code**
- Check your network/firewall settings
- Try using a different browser

### Server Won't Start
- Make sure port 3000 is not already in use
- Run `npm install` again to ensure dependencies are installed
- Check Node.js version (should be v14+)

## 📝 License

MIT License - Feel free to use and modify!

## 💖 Enjoy!

Have fun connecting with friends in the cutest video call app ever! ✨🎀

---

Made with 💖 and lots of pastel colors!
