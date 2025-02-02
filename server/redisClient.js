// src/redisClient.js
const { createClient } = require("redis");

const client = createClient({
  url: "redis://redis:6379", // Use the service name defined in docker-compose.yml
});

client.on("error", (err) => {
  console.error(`Redis error: ${err}`);
});

client
  .connect()
  .catch((err) => console.error(`Redis connection error: ${err}`));

async function removeUserFromRoom(room, username) {
  const key = `users:${room}`;
  await client.sRem(key, username);
  console.log(`Removed ${username} from room ${room}`);
}


async function getUsersInRoom(room) {
  const key = `users:${room}`;
  const users = await client.sMembers(key);
  console.log(`Users in room ${room}: ${users}`);
  return users;
}

async function isUsernameTaken(username) {
  const key = "global:usernames";
  //check case sensitivity
  const isTaken = await client.sIsMember(key, username);
  console.log(`Is ${username} taken globally? ${isTaken}`);
  return isTaken;
}

async function addUsername(username) {
  const key = "global:usernames";
  await client.sAdd(key, username);
  console.log(`Added ${username} to the global usernames set`);
}


module.exports = {
  client,
  removeUserFromRoom,
  getUsersInRoom,
  isUsernameTaken,
  addUsername
};
