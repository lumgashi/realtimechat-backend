<body>
  <h1>Chat Application</h1>
  <p>
    This is a real-time chat application built with Node.js, Express, Socket.IO, and Redis. It allows users to create rooms, join rooms, send messages, and see who is typing in real-time.
  </p>

  <div class="section">
    <h2>Getting Started</h2>
    <p>Follow these steps to set up and run the application:</p>
    <h3>Prerequisites</h3>
    <ul>
      <li>Docker and Docker Compose installed on your machine.</li>
    </ul>
    <h3>Steps</h3>
    <ol>
      <li>
        <strong>Clone the repository:</strong>
        <pre><code>https://github.com/lumgashi/realtimechat-backend.git</code></pre>
      </li>
      <li>
        <strong>Navigate to the project directory:</strong>
        <pre><code>cd realtimechat-backend</code></pre>
      </li>
      <li>
        <strong>Build and start the application using Docker Compose:</strong>
        <pre><code>docker-compose up --build</code></pre>
      </li>
      <li>
        <strong>Access the application:</strong>
        <ul>
          <li>Backend server: <code>http://localhost:3000</code></li>
          <li>Redis: <code>http://localhost:6379</code></li>
        </ul>
      </li>
    </ol>
  </div>

  <div class="section">
    <h2>Socket.IO Events</h2>
    <p>Here are the available Socket.IO events and their purposes:</p>
    <h3>Client-to-Server Events</h3>
    <ul>
      <li>
        <code>checkUsername</code>: Checks if a username is already taken.
        <pre><code>socket.emit("checkUsername", { username: "exampleUser" });</code></pre>
      </li>
      <li>
        <code>joinRoom</code>: Joins a user to a specific room.
        <pre><code>socket.emit("joinRoom", { username: "exampleUser", room: "room_123" });</code></pre>
      </li>
      <li>
        <code>sendMessage</code>: Sends a message to the current room.
        <pre><code>socket.emit("sendMessage", { text: "Hello, world!" });</code></pre>
      </li>
      <li>
        <code>createRoom</code>: Creates a new chat room.
        <pre><code>socket.emit("createRoom", { username: "exampleUser", roomName: "New Room" });</code></pre>
      </li>
      <li>
        <code>getRooms</code>: Fetches the list of available rooms.
        <pre><code>socket.emit("getRooms");</code></pre>
      </li>
      <li>
        <code>getMessages</code>: Fetches messages for a specific room.
        <pre><code>socket.emit("getMessages", { roomId: "room_123" });</code></pre>
      </li>
      <li>
        <code>userTyping</code>: Notifies the room that a user is typing.
        <pre><code>socket.emit("userTyping", { room: "room_123", username: "exampleUser" });</code></pre>
      </li>
      <li>
        <code>userStoppedTyping</code>: Notifies the room that a user has stopped typing.
        <pre><code>socket.emit("userStoppedTyping", { room: "room_123" });</code></pre>
      </li>
    </ul>
    <h3>Server-to-Client Events</h3>
    <ul>
      <li>
        <code>usernameCheckResult</code>: Returns the result of the username check.
        <pre><code>socket.on("usernameCheckResult", (data) => {
  console.log(data.isTaken); // true or false
});</code></pre>
      </li>
      <li>
        <code>roomDetails</code>: Sends details about the room to the client.
        <pre><code>socket.on("roomDetails", (data) => {
  console.log(data.roomName); // Name of the room
});</code></pre>
      </li>
      <li>
        <code>messageHistory</code>: Sends the last 10 messages in the room.
        <pre><code>socket.on("messageHistory", (messages) => {
  console.log(messages); // Array of messages
});</code></pre>
      </li>
      <li>
        <code>message</code>: Sends a new message to all users in the room.
        <pre><code>socket.on("message", (message) => {
  console.log(message); // { username, text, timestamp }
});</code></pre>
      </li>
      <li>
        <code>newRoom</code>: Notifies clients about a newly created room.
        <pre><code>socket.on("newRoom", (newRoom) => {
  console.log(newRoom); // { roomId, roomName, creator }
});</code></pre>
      </li>
      <li>
        <code>roomsList</code>: Sends the list of available rooms.
        <pre><code>socket.on("roomsList", (rooms) => {
  console.log(rooms); // Array of rooms
});</code></pre>
      </li>
      <li>
        <code>messagesList</code>: Sends the list of messages for a room.
        <pre><code>socket.on("messagesList", (messages) => {
  console.log(messages); // Array of messages
});</code></pre>
      </li>
      <li>
        <code>displayTyping</code>: Notifies clients that a user is typing.
        <pre><code>socket.on("displayTyping", (data) => {
  console.log(data.username); // Username of the typing user
});</code></pre>
      </li>
      <li>
        <code>hideTyping</code>: Notifies clients that a user has stopped typing.
        <pre><code>socket.on("hideTyping", () => {
  console.log("User stopped typing");
});</code></pre>
      </li>
    </ul>
  </div>

  <div class="section">
    <h2>Project Structure</h2>
    <ul>
      <li><code>Dockerfile</code>: Defines the Node.js environment for the application.</li>
      <li><code>docker-compose.yml</code>: Configures the Redis and chat application services.</li>
      <li><code>src/index.js</code>: Main server file with Socket.IO and Redis integration.</li>
      <li><code>src/redisClient.js</code>: Redis client setup and utility functions.</li>
    </ul>
  </div>
</body>
</html>
