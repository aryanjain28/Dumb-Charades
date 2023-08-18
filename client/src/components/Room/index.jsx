import io from "socket.io-client";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const socket = io.connect("http://localhost:3001");

const JoinRoom = (props) => {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState();

  const navigate = useNavigate();

  return (
    <Grid
      item
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={2}
      width="60%"
    >
      <TextField
        type="number"
        fullWidth
        size="small"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <TextField
        fullWidth
        size="small"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button
        sx={{ textTransform: "none" }}
        variant="contained"
        onClick={() => navigate(`game?roomId=${roomId}&user=${name}`)}
        disabled={!(name && roomId)}
      >
        Join
      </Button>
    </Grid>
  );
};

const CreateRoom = () => {
  const [name, setName] = useState("");

  const navigate = useNavigate();
  return (
    <Grid
      item
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={1}
      width={"60%"}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Enter Name"
        onChange={(e) => setName(e.target.value)}
      />
      <Button
        sx={{ textTransform: "none", width: "65%" }}
        variant="contained"
        color="success"
        onClick={() => navigate(`game?roomId=${112233}&user=${name}`)}
      >
        Create Room
      </Button>
    </Grid>
  );
};

const Room = (props) => {
  return (
    <Box>
      <Typography variant="h4" my={5}>
        Welcome!
      </Typography>
      <Grid
        container
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        width="100%"
        mt={20}
      >
        <JoinRoom />
        <Grid item xs={2} my={3}>
          <Typography variant="body1" color="GrayText">
            Or
          </Typography>
        </Grid>
        <CreateRoom />
      </Grid>
    </Box>
  );
};

export default Room;
