import { Button, Grid, Snackbar } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import webrtc from "@koush/wrtc";

const socket = io.connect("http://localhost:3001");
let peer;
let server_peer;

const GameArea = (props) => {
  const [stream, setStream] = useState();

  const viewerVideo = useRef();

  // myVideo.addEventListener("loadedmetadata", () => {
  //   console.log(
  //     `Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`
  //   );
  // });

  const handleStreamer = async () => {
    peer = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
      ],
    });
    console.log("Created local peer connection object peer");
    server_peer = await getServerPeer();

    peer.addEventListener("icecandidate", (e) => onIceCandidate(e));
    peer.addEventListener("iceconnectionstatechange", (e) =>
      onIceStateChange(peer, e)
    );

    const myStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    const video = document.getElementById("myVideo");
    video.srcObject = myStream;
    console.log(myStream);
    myStream.getTracks().forEach((track) => peer.addTrack(track, myStream));
    console.log("Added local stream to peer");

    try {
      console.log("client_peer createOffer start");
      const offer = await peer.createOffer();
      await onCreateOfferSuccess(offer);
    } catch (e) {
      console.log(`Failed to create offer: ${e.toString()}`);
    }
  };

  const onIceCandidate = async (e) => {
    try {
      await server_peer.addIceCandidate(e.candidate);
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

  const onCreateOfferSuccess = async (desc) => {
    console.log("client_peer setLocalDescription start");
    try {
      await peer.setLocalDescription(desc);
      console.log(`client_peer setLocalDescription complete`);
      console.log("Sending offer to server via API-call");
      await sendOfferToServer(desc);
    } catch (error) {
      console.log(`Failed to set session description: ${error.toString()}`);
    }
  };

  const sendOfferToServer = async (desc) => {
    console.log("Sending offer start");
    try {
      const { data } = await axios.post(`http://localhost:3001/streamer`, {
        sdp: desc.sdp,
        peer,
      });
      console.log("Offer sent successfully");
      console.log("client_peer setRemoteDescription start");
      try {
        await peer.setRemoteDescription(data.sdp);
        console.log(`client_peer setRemoteDescription complete`);
      } catch (error) {
        console.log(
          `client_peer setRemoteDescription failed`,
          error.toString()
        );
      }
    } catch (error) {
      console.log("Failed to send offer.", error.toString());
    }
  };

  const getServerPeer = async () => {
    console.log("Fetching Remote Peer Start");
    try {
      const { data } = await axios.get("http://localhost:3001/peer");
      console.log("Fetching Remote Peer Success", data.peer);
      return data.peer;
    } catch (error) {
      console.log("Fetching Remote Peer Failed", error.toString());
    }
  };

  return (
    <div id="mine">
      <video
        id="myVideo"
        playsInline
        muted
        // ref={myVideo}
        autoPlay
        style={{ border: "1px red solid", width: "100%" }}
      />
      <video
        key="viewer"
        id="viewerVideo"
        playsInline
        muted
        ref={viewerVideo}
        src={stream}
        autoPlay
        style={{ border: "1px red solid", width: "100%" }}
        onLoadedMetadata={(e) => {
          console.log("Loaded Meta-Data");
          setStream((s) => s);
        }}
        onLoadedData={(e) => console.log("LOADED")}
      />
      <Button mx={1} variant="outlined" onClick={handleStreamer}>
        Stream Me!
      </Button>
      <Button mx={1} variant="outlined" onClick={() => {}}>
        View Stream
      </Button>
    </div>
  );
};

export default GameArea;
