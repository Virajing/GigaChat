const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const authRoutes = require('./routes/authRoutes/user');
const chatRoutes = require('./routes/chatRoutes');
const groupRoutes = require('./routes/groupRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mongoConnection = require('./conn/mongo');

app.use(cors({
  origin: process.env.FRONTEND_URL || ["http://localhost:5173", "https://gigachat-three.vercel.app"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/groups", groupRoutes);
app.use("/admin", adminRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room based on user ID (for private messaging)
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { sender, recipient, content, groupId } = data;

      const newMessage = new Message({
        sender,
        recipient,
        content,
        groupId
      });
      await newMessage.save();

      // Populate sender information before emitting
      const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'username name profilePic');

      if (groupId) {
        // Broadcast to all users in the group room
        io.to(groupId).emit("receive_message", populatedMessage);
      } else {
        // Private message
        // Emit to recipient
        io.to(recipient).emit('receive_message', populatedMessage);
        // Emit to sender
        io.to(sender).emit('receive_message', populatedMessage);
      }

    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
