const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const bodyparser = require("body-parser");
const webrtc = require("@koush/wrtc");

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

let stream;
let peerRooms = {};
let peer;
let client_peer;

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
app.get("/peer", (req, res) => {
  peer = new webrtc.RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.stunprotocol.org",
      },
    ],
  });
  console.log("Created remote peer connection object peer");
  res.json({ peer });
});

app.post("/streamer", async ({ body }, res) => {
  client_peer = body.peer;
  peer.addEventListener("icecandidate", (e) => onIceCandidate(e));
  peer.addEventListener("iceconnectionstatechange", (e) =>
    onIceStateChange(peer, e)
  );
  peer.addEventListener("track", handleTrackEvent);

  // OFFER
  console.log("Offer from client");
  console.log("server setRemoteDescription start");
  try {
    await peer.setRemoteDescription(body.sdp);
    console.log(`server_peer setRemoteDescription complete`);
  } catch (error) {
    console.log(
      `server_peer Failed to set session description: ${error.toString()}`
    );
  }

  console.log("server_peer createAnswer start");
  try {
    const answer = await peer.createAnswer();
    console.log("server_peer setLocalDescription start");
    try {
      await peer.setLocalDescription(answer);
      console.log(`server_peer setLocalDescription complete`);
    } catch (error) {
      console.log(`server_peer setLocalDescription failed`, error.soString());
    }
  } catch (error) {
    console.log(`server_peer Failed to create answer: ${error.toString()}`);
  }
  const payload = { sdp: peer.localDescription };
  res.json(payload);
});

app.use("/watcher", async ({ body }, res) => {
  const peer = new webrtc.RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.stunprotocol.org",
      },
    ],
  });
  const desc = new webrtc.RTCSessionDescription(body.sdp);
  await peer.setRemoteDescription(desc);
  stream.getTracks().forEach((track) => peer.addTrack(track, stream));
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  const payload = { sdp: peer.localDescription };
  res.json(payload);
});

const onIceCandidate = async (e) => {
  try {
    await new client_peer.addIceCandidate(e.candidate);
    console.log(`addIceCandidate success`);
  } catch (error) {
    console.log(`addIceCandidate failed`, error.toString());
  }
};

const onIceStateChange = (p, event) => {
  if (p) {
    console.log(`ICE state: ${p.iceConnectionState}`);
    console.log("ICE state change event: ", event);
  }
};

const handleTrackEvent = (e) => {
  stream = e.streams[0];
  console.log("remote_server received stream");
};

server.listen(3001, () => console.log("Server Running @ 3001"));
