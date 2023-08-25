import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

const JoinRoom = () => {
  const [roomId, setRoomId] = useState();

  const navigate = useNavigate();

  return (
    <Grid
      item
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={1}
      width="80%"
    >
      <TextField
        sx={{ width: "50%" }}
        type="number"
        size="small"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <Button
        sx={{ width: "30%", textTransform: "none" }}
        variant="contained"
        onClick={() => navigate(`game?roomId=${roomId}&name=${generateName()}`)}
        disabled={!roomId}
      >
        Join Room
      </Button>
    </Grid>
  );
};

const CreateRoom = () => {
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
      <Button
        sx={{ textTransform: "none", width: "65%" }}
        variant="contained"
        color="success"
        onClick={() => navigate(`game?roomId=${uuid()}&name=${generateName()}`)}
      >
        Create New Room
      </Button>
    </Grid>
  );
};

const Room = () => {
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

const generateName = () => {
  const length = Math.floor(Math.random() * 3 + 4);
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};
