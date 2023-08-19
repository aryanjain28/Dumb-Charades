import { Box } from "@mui/material";
import { useEffect, useRef } from "react";

export const VideoStream = ({ myPeer, socket, isHost }) => {
  const myVideo = useRef();
  const remoteVideo = useRef();

  useEffect(() => {
    if (isHost) {
      // host
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: false,
        })
        .then((myStream) => {
          const video = myVideo.current;
          addVideoStream(video, myStream);

          // only host connecting to new user
          socket.on("joined_room", ({ userId }) => {
            connectToNewUser(userId, myStream);
          });
        })
        .catch(() => {});
    } else {
      // watcher
      myPeer.on("call", (call) => {
        call.answer();
        call.on("stream", (remoteVideoStream) => {
          const video = remoteVideo.current;
          addVideoStream(video, remoteVideoStream);
        });
      });
    }
  }, [isHost, socket]);

  const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
  };

  const connectToNewUser = (userId, stream) => {
    // host-Peer
    myPeer.call(userId, stream);
  };

  return (
    <Box
      height="50%"
      width="85%"
      boxShadow={3}
      borderRadius={3}
      overflow="clip"
    >
      <>{myPeer.id}</>
      {isHost ? (
        <video
          playsInline
          muted
          ref={myVideo}
          autoPlay
          style={{ width: "100%" }}
        />
      ) : (
        <video
          playsInline
          muted
          ref={remoteVideo}
          autoPlay
          style={{ width: "100%" }}
        />
      )}
    </Box>
  );
};
