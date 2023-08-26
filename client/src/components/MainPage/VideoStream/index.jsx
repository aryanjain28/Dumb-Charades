import { Typography } from "@mui/material";
import Viewer from "./Viewer";
import Streamer from "./Streamer";

const VideoStream = ({ socket, hostId, isHost, roomId }) => {
  return <></>;

  return (
    <>
      {isHost === null ? (
        <>Connecting...</>
      ) : isHost ? (
        <Streamer socket={socket} roomId={roomId} />
      ) : (
        <Viewer socket={socket} roomId={roomId} />
      )}

      {isHost !== null && (
        <Typography letterSpacing={1} variant="caption">
          {`ID: ${hostId} | Streaming: ${isHost}`}
        </Typography>
      )}
    </>
  );
};

export default VideoStream;
