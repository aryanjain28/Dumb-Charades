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
let peerRooms = {};

// io.on("connection", (socket) => {
//   socket.on("join_room", (data) => {
//     const { roomId, userId } = data;
//     // new room: create host
//     if (!(roomId in peerRooms)) {
//       peerRooms[roomId] = {
//         hostId: userId,
//         myPeerId: userId,
//         peersList: new Set(),
//       };
//     }
//     const peerRoom = peerRooms[roomId];

//     peerRoom.peersList.add(userId);

//     socket.join(roomId);
//     socket.to(roomId).emit("joined_room", {
//       ...data,
//       hostId: peerRoom.hostId,
//       isHost: peerRoom.hostId === userId,
//     });
//     console.log(
//       `Joining. Room: ${roomId} - Peer Count: ${peerRoom.peersList.size}`
//     );
//   });

//   socket.on("leave_room", ({ roomId, destroyed_peer_id }) => {
//     const peerRoom = peerRooms[roomId];

//     if (!peerRoom) return;

//     peerRoom.peersList.delete(destroyed_peer_id);

//     if (destroyed_peer_id === peerRoom.hostId) {
//       peerRoom.hostId = peerRoom.peersList.values().next().value;
//       socket.to(roomId).emit("host_changed", { hostId: peerRoom.hostId });
//       console.log(`Host Left... New Host: ${peerRoom.hostId}`);
//     }
//     console.log(
//       `Leaving. Room: ${roomId} - Peer Count: ${peerRoom.peersList.size}`
//     );
//   });

//   socket.on("change_host", ({ roomId, userId }) => {
//     const peerRoom = peerRooms[roomId];
//     peerRoom.hostId = userId;
//     socket.to(roomId).emit("host_changed", { hostId: peerRoom.hostId });
//   });

//   socket.on("send_message", (data) => {
//     socket.to(data.roomId).emit("receive_message", data);
//   });
// });

// app.use("/getHost", (req, res) => {
//   const { roomId } = req.query;
//   res.json({ hostId: peerRooms[roomId].hostId });
// });

// Streamer requests server's peer-id so that the streamer
// can request a call.

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

  stream.getTracks().forEach((track) => peer.addTrack(track, stream));
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  const payload = { sdp: peer.localDescription, peer };
  res.json(payload);
});

server.listen(3001, () => console.log("Server Running @ 3001"));
