import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Snackbar,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const server_url = "http://localhost:3001/streamer";
const Streamer = ({ socket, roomId }) => {
  const streamerVideo = useRef();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connected, setIsConnected] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    handleStreamingStart();
  }, []);

  let peer;
  const createPeerStreamer = (cb) => {
    console.log("Creating new Peer Connection.");
    peer = new RTCPeerConnection();

    peer.addEventListener("signalingstatechange", (e) =>
      console.log("Streamer SignalingState: ", peer.signalingState)
    );

    peer.addEventListener("connectionstatechange", (e) => {
      if (peer.connectionState === "connected") cb();
      console.log("Streamer ConnectionState: ", peer.connectionState);
    });

    peer.addEventListener("iceconnectionstatechange", (e) => {
      if (peer.iceConnectionState === "connected") cb();
      console.log(`Streamer IceConnectionState: ${peer.iceConnectionState}`);
    });

    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);
  };

  const handleNegotiationNeededEvent = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = { sdp: peer.localDescription, peer };
    const { data } = await axios.post(server_url, payload);
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch((e) => console.log(e));
  };

  const handleStreamingStart = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamerVideo.current.srcObject = stream;
    console.log("Streaming...", stream);

    setIsConnecting(true);
    const newIntervalId = setInterval(() => {
      createPeerStreamer(() => {
        setIsConnecting(false);
        clearInterval(newIntervalId);
        setIsConnected(true);
        socket.emit("host_started_streaming", { roomId });
      });
      setIntervalId(newIntervalId);
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    }, [500]);
  };

  const handleStreamingStop = async () => {
    setIsConnecting(false);
    setIsConnected(false);
    peer?.close();
    clearInterval(intervalId);
    setIntervalId(null);
    streamerVideo.current.srcObject = null;
  };

  return (
    <Box
      width="90%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      boxShadow={5}
    >
      <video
        id="streamerVideo"
        playsInline
        muted
        ref={streamerVideo}
        autoPlay
        style={{ width: "100%" }}
      />

      {
        isConnecting && (
          <Box display="flex" alignItems="center" justifyContent="center">
            <Typography variant="h6" color="navy" fontSize={15}>
              Connecting...
              <CircularProgress sx={{ color: "navy" }} size={12} />
            </Typography>
          </Box>
        )

        // : (
        //   connected ||
        //   (true && (
        //     <Button
        //       mx={1}
        //       variant="outlined"
        //       onClick={handleStreamingStart}
        //       color={"error"}
        //       sx={{ textTransform: "none" }}
        //     >
        //       Stop Streaming
        //     </Button>
        //   ))
        // )
      }
    </Box>
  );
};

export default Streamer;
