import { Box, Grid, Snackbar } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import ChatBox from "./ChatBox";
import { VideoStream } from "./VideoStream";
import GuessString from "./GuessString";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io.connect("http://localhost:3001");

const GameArea = (props) => {
  const [toast, setToast] = useState("");
  const [searchParams] = useSearchParams();
  const [roomId, setRoomId] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const roomId = searchParams.get("roomId");
    setRoomId(roomId);

    const username = searchParams.get("user");
    setUsername(username);

    socket.emit("join_room", { roomId, username });
  }, []);

  useEffect(() => {
    socket.on("joined_room", (message) => {
      setToast(message);
    });
  }, [socket]);

  return (
    <>
      <Grid
        container
        display="flex"
        alignItems="start"
        justifyContent={"space-between"}
      >
        <Grid item xs={8}>
          {socket && (
            <ChatBox socket={socket} roomId={roomId} username={username} />
          )}
        </Grid>
        <Grid
          container
          item
          xs={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="start"
          gap={1}
        >
          <GuessString text={"Aryan"} />
          {/* <VideoStream /> */}
        </Grid>
        <Grid item></Grid>
      </Grid>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(toast)}
        autoHideDuration={2500}
        message={toast}
        onClose={(e, r) => setToast("")}
      />
    </>
  );
};

export default GameArea;
