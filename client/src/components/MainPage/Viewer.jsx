import { Button } from "@mui/material";
import { useRef } from "react";
import axios from "axios";

const server_url = "http://localhost:3001/watcher";

const Viewer = () => {
  const viewerVideo = useRef();

  const createPeerViewer = async () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
      ],
    });

    peer.onconnectionstatechange = (e) =>
      console.log(`Viewer: ${peer.iceConnectionState}`);

    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
  };

  const handleNegotiationNeededEvent = async (peer) => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
      sdp: peer.localDescription,
      peer,
    };
    const { data } = await axios.post(server_url, payload);
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch((e) => console.log(e));
    // peer.onicecandidate = async (e) =>
    //   await new RTCPeerConnection(data.peer).addIceCandidate(e.candidate);
  };

  const handleViewer = async () => {
    const peer = await createPeerViewer();
    peer.addTransceiver("video", { direction: "recvonly" });
  };

  const handleTrackEvent = (e) => {
    console.log(e.streams[0]);
    const video = document.getElementById("viewerVideo");
    video.srcObject = e.streams[0];
    // video.play();
    video.addEventListener("loadedmetadata", () => {
      console.log("loadedmetadata");
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
      <Button mx={1} variant="outlined" onClick={handleViewer}>
        View Stream
      </Button>
    </div>
  );
};

export default Viewer;
