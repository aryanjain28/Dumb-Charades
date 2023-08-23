import { Box } from "@mui/material";
import Viewer from "./Viewer";
import Streamer from "./Streamer";

const VideoStream = () => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-around">
      <Streamer />
      <Viewer />
    </Box>
  );
};

export default VideoStream;
