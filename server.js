const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Store rooms and users
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // Handle joining a room
  socket.on('join-room', ({ roomCode, username, avatar }) => {
    console.log(`${username} joining room: ${roomCode}`);
    
    // Join the socket.io room
    socket.join(roomCode);
    
    // Store user info
    socket.username = username;
    socket.avatar = avatar;
    socket.roomCode = roomCode;
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomCode)) {
      rooms.set(roomCode, new Map());
    }
    
    const room = rooms.get(roomCode);
    room.set(socket.id, { username, avatar });
    
    // Get all users in the room except the new user
    const usersInRoom = Array.from(room.entries())
      .filter(([id]) => id !== socket.id)
      .map(([id, user]) => ({ id, ...user }));
    
    // Send existing users to the new user
    socket.emit('existing-users', usersInRoom);
    
    // Notify other users in the room about the new user
    socket.to(roomCode).emit('user-joined', {
      id: socket.id,
      username,
      avatar
    });
    
    console.log(`Room ${roomCode} now has ${room.size} users`);
  });

  // Handle WebRTC signaling - offer
  socket.on('offer', ({ offer, to }) => {
    console.log(`Sending offer from ${socket.id} to ${to}`);
    io.to(to).emit('offer', {
      offer,
      from: socket.id,
      username: socket.username,
      avatar: socket.avatar
    });
  });

  // Handle WebRTC signaling - answer
  socket.on('answer', ({ answer, to }) => {
    console.log(`Sending answer from ${socket.id} to ${to}`);
    io.to(to).emit('answer', {
      answer,
      from: socket.id
    });
  });

  // Handle ICE candidates
  socket.on('ice-candidate', ({ candidate, to }) => {
    io.to(to).emit('ice-candidate', {
      candidate,
      from: socket.id
    });
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.roomCode) {
      const room = rooms.get(socket.roomCode);
      if (room) {
        room.delete(socket.id);
        
        // Notify others in the room
        socket.to(socket.roomCode).emit('user-left', socket.id);
        
        // Clean up empty rooms
        if (room.size === 0) {
          rooms.delete(socket.roomCode);
          console.log(`Room ${socket.roomCode} deleted (empty)`);
        } else {
          console.log(`Room ${socket.roomCode} now has ${room.size} users`);
        }
      }
    }
  });

  // Handle explicit leave room
  socket.on('leave-room', () => {
    if (socket.roomCode) {
      console.log(`${socket.username} leaving room: ${socket.roomCode}`);
      
      const room = rooms.get(socket.roomCode);
      if (room) {
        room.delete(socket.id);
        socket.to(socket.roomCode).emit('user-left', socket.id);
        
        if (room.size === 0) {
          rooms.delete(socket.roomCode);
        }
      }
      
      socket.leave(socket.roomCode);
      socket.roomCode = null;
    }
  });
});

server.listen(PORT, () => {
  console.log(`🎀 Cute Video Call Server running on http://localhost:${PORT}`);
});
