const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { ExpressPeerServer } = require("peer");
const bodyparser = require("body-parser");

app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

const server = http.createServer(app);

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  wsEngine: require("eiows").Server,
});

let hostId = null;
let peers = new Set();
let myPeerId = null;
let currentRoomId = null;

io.on("connection", (socket) => {
  socket.on("join_room", (data) => {
    const { roomId, userId } = data;

    if (!hostId) hostId = userId;

    currentRoomId = roomId;
    myPeerId = userId;
    peers.add(data.userId);
    socket.join(roomId);
    socket.nsp
      .to(roomId)
      .emit("joined_room", { ...data, hostId, isHost: hostId === userId });
    console.log("Joining Room. New Peer Count: ", peers.size);
  });

  socket.on("leave_room", ({ roomId, destroyed_peer_id }) => {
    peers.delete(destroyed_peer_id);

    if (destroyed_peer_id === hostId) {
      hostId = peers.values().next().value;
      socket.to(roomId).emit("host_changed", { hostId });
      console.log(`Host Left... New Host: ${hostId}`);
    }
    console.log("Leaving Room. New Peer Count: ", peers.size);
  });

  socket.on("change_host", ({ roomId, userId }) => {
    hostId = userId;
    socket.to(roomId).emit("host_changed", { hostId });
  });

  socket.on("send_message", (data) => {
    socket.to(data.roomId).emit("receive_message", data);
  });

  socket.on("stream_my_video", (data) => {
    const { signal, roomId } = data;
    console.log("stream_my_video", roomId);
    socket.to(roomId).emit("streaming_hosts_video", signal);
  });

  socket.on("disconnect", (reason) => {});
});

app.use("/getHost", (req, res) => {
  res.json({ hostId });
});

server.listen(3001, () => console.log("Server Running @ 3001"));
