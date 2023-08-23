import { Box, Button, Grid, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import Viewer from "./Viewer";
import Streamer from "./Streamer";

const GameArea = () => {
  const [serverPeer, setServerPeer] = useState();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    // const { data } = await axios.get("http://localhost:3001/peer");
    // setServerPeer(data.peer);
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="space-around">
      <Streamer />
      <Viewer />
    </Box>
  );
};

export default GameArea;
