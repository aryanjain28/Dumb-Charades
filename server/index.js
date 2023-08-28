const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const bodyparser = require("body-parser");
const webrtc = require("@koush/wrtc");
require("dotenv").config();

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

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  wsEngine: require("ws").Server,
});

let roomData = {};

io.of("/").adapter.on("create-room", (room) => {
  // console.log(`CREATE: ${room}`);
});

io.of("/").adapter.on("delete-room", (room) => {
  // console.log(`DEL: ${room}`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  // console.log(`JOIN: ${room} ${id}`);
});

io.of("/").adapter.on("leave-room", (room, id) => {
  // console.log(`LEFT: ${room} ${id}`);
});

io.on("connection", (socket) => {
  socket.on("user_joining_room", ({ name, roomId, userId }) => {
    socket.join(roomId);
    const roomSize = io.sockets.adapter.rooms.get(roomId)?.size;

    socket.isHost = false;
    if (roomSize === 1) {
      console.log("Setting this user as host");
      findAndSetNewHost(roomId);
      socket.isHost = true;
    }

    socket.name = name;
    io.to(roomId).emit("user_joined", {
      name: socket.name,
      userId,
      hostId: getHost(roomId).id,
    });
    io.to(roomId).emit("room_updated", { names: getUsers(roomId) });
    console.log("Join::Count:", roomSize);
  });

  socket.on("user_leaving_room", ({ roomId, userId }) => {
    if (socket.isHost) {
      console.log("Host Left. Changing Host");
      findAndSetNewHost(roomId);
    }

    socket.leave(roomId); // just to be safer!
    socket.leave(userId); // just to be safer!

    console.log("socket.isHost: ", socket.isHost);
    Array.from(socket.rooms).forEach((rid) => socket.leave(rid));
    io.to(roomId).emit("user_left");
    io.to(roomId).emit("room_updated", { names: getUsers(roomId) });
    console.log("Left::Count:", io.sockets.adapter.rooms.get(roomId)?.size);
  });

  socket.on("change_host", ({ roomId }) => {
    findAndSetNewHost(roomId);
  });

  socket.on("host_started_streaming", ({ roomId }) => {
    console.log("Restart streaming for viewer");
    socket.broadcast.emit("host_streaming", {
      message: "Restart Peer Connection",
    });
  });

  socket.on("send_message", (data) => {
    io.to(data.roomId).emit("receive_message", data);
  });

  socket.on("movie_set", ({ roomId, movie }) => {
    roomData[roomId] = movie;
    socket.to(roomId).emit("movie_for_you", { movie: roomData[roomId] });
  });

  socket.on("send_movie_to_user", ({ roomId, userId }) => {
    socket.to(roomId).emit("movie_for_you", { movie: roomData[roomId] });
  });

  socket.on("disconnect", () => {
    Array.from(socket.rooms).forEach((rid) => socket.leave(rid));
  });

  const findAndSetNewHost = (roomId) => {
    const sids = io.sockets.adapter.rooms.get(roomId);
    if (!sids || sids.size === 0) return;

    const sockets = Array.from(sids).map((id) => io.sockets.sockets.get(id));
    const currHost = sockets.find(({ isHost }) => isHost);
    const nonHosts = sockets.filter(({ isHost }) => !isHost);
    if (!nonHosts) return;

    const newHost = nonHosts[Math.floor(Math.random() * nonHosts.length)];
    if (!newHost) return;

    newHost && (newHost.isHost = true);
    currHost && (currHost.isHost = false);

    io.to(roomId).emit("host_changed", { hostId: newHost.id });
  };

  const getHost = (roomId) => {
    const sids = io.sockets.adapter.rooms.get(roomId);
    if (sids.size === 0) return null;

    const sockets = Array.from(sids).map((id) => io.sockets.sockets.get(id));
    return sockets.find(({ isHost }) => isHost);
  };

  const getUsers = (roomId) => {
    const sids = io.sockets.adapter.rooms.get(roomId);
    if (!sids || sids.size === 0) return [];
    const sockets = Array.from(sids).map((id) => io.sockets.sockets.get(id));
    const names = sockets?.map(({ name }) => name);
    return names;
  };
});

let stream;

app.post("/streamer", async ({ body }, res) => {
  const peer = new webrtc.RTCPeerConnection();
  peer.ontrack = (e) => (stream = e.streams[0]);
  const desc = new webrtc.RTCSessionDescription(body.sdp);
  await peer.setRemoteDescription(desc);

  // peer.onicecandidate = async (e) =>
  //   await new RTCPeerConnection(body.peer).addIceCandidate(e.candidate);

  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  const payload = { sdp: peer.localDescription, peer };
  res.json(payload);
});

app.use("/watcher", async ({ body }, res) => {
  const peer = new webrtc.RTCPeerConnection();
  const desc = new webrtc.RTCSessionDescription(body.sdp);
  await peer.setRemoteDescription(desc);
  // peer.onicecandidate = async (e) =>
  //   await new RTCPeerConnection(body.peer).addIceCandidate(e.candidate);

  if (stream)
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  const payload = { sdp: peer.localDescription, peer };
  res.json(payload);
});

server.listen(3001, () => console.log("Server Running @ 3001"));
