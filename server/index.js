const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join_room", (data) => {
    const { roomId, username } = data;
    socket.join(roomId);
    console.log(`${username} joined Room: ${roomId}`);

    socket.to(roomId).emit("joined_room", `${username} joined Room: ${roomId}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.roomId).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User left", socket.id);
  });
});

server.listen(3001, () => console.log("Server Running @ 3001"));
