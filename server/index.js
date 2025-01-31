// src/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const redisClient = require("./redisClient");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", async ({ username, room }) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;

    // Fetch last 10 messages from Redis
    const messageKeys = await redisClient.lRange(`messages:${room}`, 0, 9); // Get the latest 10 messages
    const messages = await Promise.all(
      messageKeys.map(async (key) => {
        const message = await redisClient.get(key);
        return JSON.parse(message);
      })
    );

    socket.emit("messageHistory", messages.reverse()); // Reverse to show newest first

    socket.broadcast.to(room).emit("message", {
      username: "Admin",
      text: `${username} has joined the chat`,
    });
  });

  socket.on("sendMessage", async ({ text }) => {
    const message = {
      username: socket.username,
      text,
      timestamp: new Date().toISOString(),
    };

    // Store the message in Redis
    const messageId = `message:${socket.room}:${Date.now()}`;
    await redisClient.set(messageId, JSON.stringify(message));
    await redisClient.lPush(`messages:${socket.room}`, messageId);

    // Broadcast the message to all users in the same room
    io.to(socket.room).emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    if (socket.username && socket.room) {
      io.to(socket.room).emit("message", {
        username: "Admin",
        text: `${socket.username} has left the chat`,
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
