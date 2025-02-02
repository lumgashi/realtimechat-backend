// src/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const redis = require("./redisClient");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3000;

io.on("connection", async (socket) => {
  console.log("A user connected");

  socket.on("checkUsername", async ({ username }) => {

    // Check if the username is already taken 
    const isTaken = await redis.isUsernameTaken(username);
    console.log(`Is ${username} taken globally? ${isTaken}`);

    if (!isTaken) {
      // If the username is not taken, add it to the set in Redis
      await redis.addUsername(username);
      console.log(`Added ${username} to the global usernames set`);
    }

    socket.emit("usernameCheckResult", { isTaken });
  });

  socket.on("joinRoom", async ({ username, room }) => {

    if (!username || !room) {
      socket.emit("authError", "Username and room are required.");
      return;
    }

    const roomKey = room.startsWith("room:") ? room : `room:${room}`;
    console.log("Final room key:", roomKey);

    socket.join(roomKey);
    socket.username = username;
    socket.room = roomKey;

    const roomName = await redis.client.hGet(roomKey, "name");
    console.log("Room Name:", roomName);

    socket.emit("roomDetails", { roomName });

    const messageKeys = await redis.client.lRange(
      `messages:${roomKey}`,
      -10,
      -1
    );

    const messages = await Promise.all(
      messageKeys.map(async (key) => {
        const message = await redis.client.get(key);
        return JSON.parse(message);
      })
    );

    socket.emit("messageHistory", messages);
  });


  socket.on("sendMessage", async ({ text }) => {
    if (!socket.username) {
      console.error("User is not authenticated.");
      return;
    }

    if (!socket.room) {
      console.error("User is not in a room.");
      return;
    }

    const roomKey = socket.room.startsWith("room:")
      ? socket.room
      : `room:${socket.room}`;

    const message = {
      username: socket.username,
      text,
      timestamp: new Date().toISOString(),
    };

    const messageId = `message:${roomKey}:${Date.now()}`;
    await redis.client.set(messageId, JSON.stringify(message));
    await redis.client.lPush(`messages:${roomKey}`, messageId);

    io.to(roomKey).emit("message", message);
  });


  socket.on("createRoom", async ({ username, roomName }) => {
    if (!roomName) {
      socket.emit("error", "Room name is required.");
      return;
    }


    // Get all existing rooms
    const existingRooms = await redis.client.keys("room:*");
   // Check if the room name already exists
    const roomExists = (
      await Promise.all(
        existingRooms.map(async (roomKey) => {
          const name = await redis.client.hGet(roomKey, "name");
          return name === roomName;
        })
      )
    ).some(Boolean);

    if (roomExists) {
      socket.emit("roomExists", {
        error: `Room "${roomName}" already exists.`,
      });
      return;
    }


    const roomId = `room_${Date.now()}`;


    await redis.client.hSet(`room:${roomId}`, {
      name: roomName,
      creator: username,
      createdAt: new Date().toISOString(),
    });

    const newRoom = { roomId, roomName, creator: username };
    io.emit("newRoom", newRoom);
  });

  socket.on("getRooms", async () => {
    const existingRooms = await redis.client.keys("room:*");

    const roomsList = await Promise.all(
      existingRooms.map(async (roomKey) => {
        const roomName = await redis.client.hGet(roomKey, "name");
        return { roomId: roomKey, roomName };
      })
    );

    socket.emit("roomsList", roomsList);
  });


  socket.on("getMessages", async ({ roomId }) => {

    const roomKey = roomId.startsWith("room:") ? roomId : `room:${roomId}`;

    const messageKeys = await redis.client.lRange(`messages:${roomKey}`, 0, -1);

    const messages = await Promise.all(
      messageKeys.map(async (key) => {
        const message = await redis.client.get(key);
        return JSON.parse(message);
      })
    );

    socket.emit("messagesList", messages.reverse());
  });


socket.on("userTyping", ({ room, username }) => {
  const roomKey = room.startsWith("room:") ? room : `room:${room}`;
  socket.broadcast.to(roomKey).emit("displayTyping", { username });
});

socket.on("userStoppedTyping", ({ room }) => {
  const roomKey = room.startsWith("room:") ? room : `room:${room}`;
  socket.broadcast.to(roomKey).emit("hideTyping");
});

  socket.on("disconnect", async () => {
    console.log("A user disconnected");
    if (socket.username && socket.room) {
      await redis.removeUserFromRoom(socket.room, socket.username);

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
