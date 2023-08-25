import { Button, Grid } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChatBox from "./ChatBox";
import GuessString from "./GuessString";
import VideoStreaming from "./VideoStream/index";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const GameArea = () => {
  const socket = io.connect("http://localhost:3001");

  const [searchParams] = useSearchParams();
  const [isHost, setIsHost] = useState(false);
  const [userId, setUserId] = useState(null);

  const roomId = searchParams.get("roomId");
  const navigate = useNavigate();

  useEffect(() => {
    socket.connect();
    window.addEventListener("beforeunload", userLeft);
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("user_joining_room", { roomId, userId: socket.id });
      setUserId(socket.id);
    });
  }, [socket.id]);

  socket.on("user_joined", ({ isHost }) => {
    console.log("JOINED: ", isHost);
    setIsHost(isHost);
  });

  socket.on("host_changed", ({ hostId }) => {
    console.log("Host-Changed: ", hostId, socket.id);
    setIsHost(hostId === socket.id);
  });

  useEffect(() => {
    socket.on("user_left", () => {
      socket.disconnect();
    });
  }, [socket]);

  useEffect(() => {
    return () => {
      userLeft();
      window.removeEventListener("beforeunload", userLeft);
    };
  }, []);

  const userLeft = () => {
    socket.emit("user_leaving_room", { roomId, userId: socket.id });
    socket.disconnect();
  };

  return (
    <Grid
      container
      display="flex"
      alignItems="start"
      justifyContent={"space-between"}
    >
      <Grid item xs={2}>
        {socket && (
          <ChatBox
            socket={socket}
            roomId={searchParams.get("roomId")}
            username={searchParams.get("user")}
          />
        )}
      </Grid>
      <Grid
        container
        item
        xs={8}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="start"
        gap={1}
      >
        <GuessString text={`Host: ${isHost} ${userId}`} />
        <VideoStreaming isHost={isHost} />
      </Grid>
      <Grid item>
        <Button
          sx={{ textTransform: "none" }}
          variant="contained"
          color="error"
          onClick={() => {
            userLeft();
            navigate("/");
          }}
        >
          Exit
        </Button>
      </Grid>
    </Grid>
  );
};

export default GameArea;
