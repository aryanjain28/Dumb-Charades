import { Button, CircularProgress } from "@mui/material";
import { useRef, useState } from "react";
import axios from "axios";

const server_url = "http://localhost:3001/watcher";

const Viewer = () => {
  const viewerVideo = useRef();

  const [connected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  let peer;
  const createPeerViewer = async (cb) => {
    peer = new RTCPeerConnection();
    console.log("Creating new Peer Connection.");

    peer.addEventListener("signalingstatechange", (e) =>
      console.log("Viewer SignalingState: ", peer.signalingState)
    );

    peer.addEventListener("connectionstatechange", (e) => {
      if (peer.connectionState === "connected") cb();
      console.log("Viewer ConnectionState: ", peer.connectionState);
    });

    peer.addEventListener("iceconnectionstatechange", (e) => {
      if (peer.iceConnectionState === "connected") cb();
      console.log(`Viewer IceConnectionState: ${peer.iceConnectionState}`);
    });

    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
  };

  const handleNegotiationNeededEvent = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
      sdp: peer.localDescription,
      peer,
    };
    const { data } = await axios.post(server_url, payload);
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch((e) => console.log(e));
  };

  const handleViewerStreamingStart = async () => {
    setIsConnecting(true);
    const newIntervalId = setInterval(async () => {
      await createPeerViewer(() => {
        clearInterval(newIntervalId);
        setIsConnecting(false);
        setIsConnected(true);
      });
      setIntervalId(newIntervalId);
      peer.addTransceiver("video", { direction: "recvonly" });
    }, [500]);
  };

  const handleViewerStreamingStop = () => {
    setIsConnecting(false);
    setIsConnected(false);
    clearInterval(intervalId);
    setIntervalId(null);
    peer?.close();
    viewerVideo.current.srcObject = null;
  };

  const handleTrackEvent = (e) => {
    const video = document.getElementById("viewerVideo");
    video.srcObject = e.streams[0];
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
  };

  return (
    <div>
      <video
        id="viewerVideo"
        playsInline
        muted
        autoPlay
        ref={viewerVideo}
        style={{ border: "1px red solid", width: "100%" }}
      />
      <Button
        endIcon={isConnecting && <CircularProgress color="error" size={18} />}
        mx={1}
        variant="outlined"
        onClick={
          connected || isConnecting
            ? handleViewerStreamingStop
            : handleViewerStreamingStart
        }
        color={connected || isConnecting ? "error" : "primary"}
      >
        {connected || isConnecting
          ? `Stop ${connected ? "Stream" : ""}`
          : "View Stream"}
      </Button>
    </div>
  );
};

export default Viewer;
