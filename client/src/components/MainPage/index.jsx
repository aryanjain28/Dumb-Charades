import { Button, Grid, Snackbar } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

import axios from "axios";

const socket = io.connect("http://localhost:3001");

const GameArea = (props) => {
  const [searchParams] = useSearchParams();
  const [hostId, setHostId] = useState();
  const [isHost, setIsHost] = useState(false);
  const [userId, setUserId] = useState();
  const [stream, setStream] = useState();

  const myVideo = useRef();
  const viewerVideo = useRef();

  window.addEventListener("iceconnectionstatechange", (event) => {
    console.log("----EVENT----: ", event);
  });

  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
      ],
    });
    console.log("Streamer connection state: ", peer.iceConnectionState);
    peer.addEventListener("iceconnectionstatechange", (e) =>
      console.log(`Streamer: ${peer.iceConnectionState}`)
    );
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);
    return peer;
  };

  const createPeerV = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
      ],
    });

    console.log("ON__TREACK");
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer, true);
    console.log("Viewer connection state: ", peer.iceConnectionState);
    peer.addEventListener("iceconnectionstatechange", (e) =>
      console.log(`Viewer: ${peer.iceConnectionState}`)
    );
    peer.ontrack = handleTrackEvent;
    return peer;
  };

  const handleNegotiationNeededEvent = async (peer, watcher = false) => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = { sdp: peer.localDescription };
    const { data } = await axios.post(
      `http://localhost:3001/${watcher ? "watcher" : "streamer"}`,
      payload
    );
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch((e) => console.log(e));
  };

  const handleStreamer = async () => {
    const peer = createPeer();
    const myStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    const video = myVideo.current;
    video.srcObject = myStream;
    console.log(myStream);
    myStream.getTracks().forEach((track) => peer.addTrack(track, myStream));
  };

  const handleViewer = async () => {
    console.log("Inside Handle Viewer");
    const peer = createPeerV();
    peer.addTransceiver("video", { direction: "recvonly" });
    // viewerVideo.current.dispatchEvent(new Event("loadedmetadata"));
  };

  const handleTrackEvent = (e) => {
    if (viewerVideo.current.srcObject !== e.streams[0]) {
      viewerVideo.current.srcObject = e.streams[0];
      console.log("pc received remote stream");
    }
    // addVideoStream(video, e.streams[0]);
  };

  const addVideoStream = (video, stream) => {
    console.log("Inside setting up viewerer stream");
    viewerVideo.current.srcObject = stream;
    console.log(stream);
    viewerVideo.current.addEventListener("loadedmetadata", () => {
      console.log("Inside event!!!!");
      viewerVideo.current.play();
    });
  };

  return (
    <div id="mine">
      <video
        id="myVideo"
        playsInline
        muted
        ref={myVideo}
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
      <Button mx={1} variant="outlined" onClick={handleViewer}>
        View Stream
      </Button>
    </div>

    // <Grid
    //   container
    //   display="flex"
    //   alignItems="start"
    //   justifyContent={"space-between"}
    // >
    //   <Grid item xs={2}>
    //     {socket && (
    //       <ChatBox
    //         socket={socket}
    //         roomId={searchParams.get("roomId")}
    //         username={searchParams.get("user")}
    //       />
    //     )}
    //   </Grid>
    //   <Grid
    //     container
    //     item
    //     xs={8}
    //     display="flex"
    //     flexDirection="column"
    //     alignItems="center"
    //     justifyContent="start"
    //     gap={1}
    //   >
    //     <GuessString text={`Host: ${isHost} ${searchParams.get("user")}`} />
    //     {userId !== undefined && hostId !== undefined && (
    //       <VideoStream
    //         isHost={isHost}
    //         username={searchParams.get("user")}
    //         roomId={searchParams.get("roomId")}
    //         socket={socket}
    //         myPeer={myPeer}
    //       />
    //     )}
    //   </Grid>
    //   <Grid item>
    //     <Button
    //       sx={{ textTransform: "none" }}
    //       variant="contained"
    //       color="error"
    //       onClick={() => navigate("/")}
    //     >
    //       Exit
    //     </Button>
    //   </Grid>
    // </Grid>
  );
};

export default GameArea;
