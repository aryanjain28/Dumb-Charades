import io from "socket.io-client";
import Webcam from "react-webcam";
import { Box } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const socket = io.connect("http://localhost:3001");

export const VideoStream = (props) => {
  return (
    <Box
      height="50%"
      width="85%"
      boxShadow={3}
      borderRadius={3}
      overflow="clip"
    >
      <Webcam audio={false} width="100%" />
    </Box>
  );
};
