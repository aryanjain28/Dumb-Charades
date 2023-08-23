import { Button, CircularProgress, Grid, Snackbar } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const server_url = "http://localhost:3001/streamer";
const Streamer = () => {
  const streamerVideo = useRef();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connected, setIsConnected] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

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
    <div>
      <video
        id="streamerVideo"
        playsInline
        muted
        ref={streamerVideo}
        autoPlay
        style={{ border: "1px red solid", width: "100%" }}
      />

      <Button
        endIcon={isConnecting && <CircularProgress color="error" size={18} />}
        mx={1}
        variant="outlined"
        onClick={
          connected || isConnecting ? handleStreamingStop : handleStreamingStart
        }
        color={connected || isConnecting ? "error" : "primary"}
      >
        {connected || isConnecting
          ? `Stop ${connected ? "Stream" : ""}`
          : "Stream"}
      </Button>
    </div>
  );
};

export default Streamer;
