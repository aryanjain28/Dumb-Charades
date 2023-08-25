import { Box } from "@mui/material";
import Viewer from "./Viewer";
import Streamer from "./Streamer";
import { useState } from "react";

const VideoStream = ({ isHost }) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-around">
      {isHost ? <Streamer /> : <Viewer />}
    </Box>
  );
};

export default VideoStream;
