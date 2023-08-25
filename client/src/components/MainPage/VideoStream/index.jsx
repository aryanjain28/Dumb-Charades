import { Box, Typography } from "@mui/material";
import Viewer from "./Viewer";
import Streamer from "./Streamer";
import { useState } from "react";

const VideoStream = ({ hostId, isHost }) => {
  console.log(hostId, isHost);

  return <></>;

  return (
    <>
      {hostId === null ? (
        <>Connecting...</>
      ) : isHost ? (
        <Streamer />
      ) : (
        <Viewer />
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
