require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Initialize Supabase client (server-side with service role key)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log('✅ Supabase initialized');
} else {
  console.warn('⚠️  Supabase credentials not found in environment variables');
  console.warn('    The app will work but without database persistence');
  console.warn('    Please create a .env file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Store rooms and users (in-memory fallback)
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // Handle joining a room
  socket.on('join-room', async ({ roomCode, username, avatar, userId }) => {
    console.log(`${username} (${userId}) joining room: ${roomCode}`);

    // Join the socket.io room
    socket.join(roomCode);

    // Store user info
    socket.username = username;
    socket.avatar = avatar;
    socket.roomCode = roomCode;
    socket.userId = userId;

    // Initialize room in memory if it doesn't exist
    if (!rooms.has(roomCode)) {
      rooms.set(roomCode, new Map());
    }

    const room = rooms.get(roomCode);
    room.set(socket.id, { username, avatar, userId });

    // Track participant in Supabase database
    if (supabase && userId) {
      try {
        // Get room from database
        const { data: roomData } = await supabase
          .from('rooms')
          .select('id')
          .eq('code', roomCode)
          .single();

        if (roomData) {
          // Add participant record
          await supabase
            .from('room_participants')
            .insert([
              {
                room_id: roomData.id,
                user_id: userId,
                joined_at: new Date().toISOString()
              }
            ]);

          console.log(`✅ Tracked participant ${username} in database`);
        }
      } catch (error) {
        console.error('Error tracking participant in database:', error.message);
      }
    }

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
      avatar,
      userId
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
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);

    if (socket.roomCode) {
      const room = rooms.get(socket.roomCode);
      if (room) {
        room.delete(socket.id);

        // Update participant left_at timestamp in database
        if (supabase && socket.userId) {
          try {
            const { data: roomData } = await supabase
              .from('rooms')
              .select('id')
              .eq('code', socket.roomCode)
              .single();

            if (roomData) {
              await supabase
                .from('room_participants')
                .update({ left_at: new Date().toISOString() })
                .eq('room_id', roomData.id)
                .eq('user_id', socket.userId)
                .is('left_at', null);

              console.log(`✅ Updated participant ${socket.username} left_at in database`);
            }
          } catch (error) {
            console.error('Error updating participant in database:', error.message);
          }
        }

        // Notify others in the room
        socket.to(socket.roomCode).emit('user-left', socket.id);

        // Clean up empty rooms
        if (room.size === 0) {
          rooms.delete(socket.roomCode);
          console.log(`Room ${socket.roomCode} deleted (empty)`);

          // Mark room as inactive in database
          if (supabase) {
            try {
              await supabase
                .from('rooms')
                .update({ is_active: false })
                .eq('code', socket.roomCode);
            } catch (error) {
              console.error('Error marking room inactive:', error.message);
            }
          }
        } else {
          console.log(`Room ${socket.roomCode} now has ${room.size} users`);
        }
      }
    }
  });

  // Handle explicit leave room
  socket.on('leave-room', async () => {
    if (socket.roomCode) {
      console.log(`${socket.username} leaving room: ${socket.roomCode}`);

      const room = rooms.get(socket.roomCode);
      if (room) {
        room.delete(socket.id);
        socket.to(socket.roomCode).emit('user-left', socket.id);

        // Update database
        if (supabase && socket.userId) {
          try {
            const { data: roomData } = await supabase
              .from('rooms')
              .select('id')
              .eq('code', socket.roomCode)
              .single();

            if (roomData) {
              await supabase
                .from('room_participants')
                .update({ left_at: new Date().toISOString() })
                .eq('room_id', roomData.id)
                .eq('user_id', socket.userId)
                .is('left_at', null);
            }
          } catch (error) {
            console.error('Error updating participant:', error.message);
          }
        }

        if (room.size === 0) {
          rooms.delete(socket.roomCode);

          if (supabase) {
            try {
              await supabase
                .from('rooms')
                .update({ is_active: false })
                .eq('code', socket.roomCode);
            } catch (error) {
              console.error('Error marking room inactive:', error.message);
            }
          }
        }
      }

      socket.leave(socket.roomCode);
      socket.roomCode = null;
    }
  });
});

server.listen(PORT, () => {
  console.log(`🎀 Cute Video Call Server running on http://localhost:${PORT}`);
  if (!supabase) {
    console.log(`⚠️  Running without Supabase integration - create .env file to enable`);
  }
});
