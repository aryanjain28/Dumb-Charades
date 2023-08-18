import io from "socket.io-client";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";

const socket = io.connect("http://localhost:3001");

const JoinRoom = (props) => {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState();

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
      />
      <TextField
        fullWidth
        size="small"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button sx={{ textTransform: "none" }} variant="contained">
        Join
      </Button>
    </Grid>
  );
};

const CreateRoom = () => {
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
        type="number"
        size="small"
        placeholder="No. of members"
      ></TextField>
      <TextField fullWidth size="small" placeholder="Enter Name"></TextField>
      <Button
        sx={{ textTransform: "none", width: "65%" }}
        variant="contained"
        color="success"
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
