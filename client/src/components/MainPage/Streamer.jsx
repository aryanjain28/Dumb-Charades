import { Button, Grid, Snackbar } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const server_url = "http://localhost:3001/streamer";

const Streamer = () => {
  const streamerVideo = useRef();

  const createPeerStreamer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
      ],
    });

    peer.addEventListener("iceconnectionstatechange", (e) =>
      console.log(`Streamer: ${peer.iceConnectionState}`)
    );
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
  };

  const handleNegotiationNeededEvent = async (peer) => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = { sdp: peer.localDescription, peer };
    const { data } = await axios.post(server_url, payload);
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch((e) => console.log(e));
    // peer.onicecandidate = (e) =>
    //   new RTCPeerConnection(data.peer).addIceCandidate(e.candidate);
  };

  const handleStreamer = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamerVideo.current.srcObject = stream;
    console.log("Streaming...", stream);
    const peer = createPeerStreamer();
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
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
        onLoadedMetadata={() => console.log("LoadedMetaData")}
      />

      <Button mx={1} variant="outlined" onClick={handleStreamer}>
        Start Stream
      </Button>
    </div>
  );
};

export default Streamer;
