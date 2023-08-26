import { Button, Grid } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChatBox from "./ChatBox";
import GuessString from "./GuessString";
import VideoStreaming from "./VideoStream/index";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";

const GameArea = () => {
  const socket = io.connect("http://localhost:3001");

  const [searchParams] = useSearchParams();
  const [isHost, setIsHost] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);

  const roomId = searchParams.get("roomId");
  const navigate = useNavigate();

  useEffect(() => {
    socket.connect();
    window.addEventListener("beforeunload", userLeft);
  }, []);

  useEffect(() => {
    return () => {
      userLeft();
      // window.removeEventListener("beforeunload", userLeft);
    };
  }, []);

  useEffect(() => {
    socket.on("connect", async () => {
      socket.emit("user_joining_room", {
        name: searchParams.get("name"),
        roomId,
        userId: socket.id,
      });
      setUserId(socket.id);
      // setIsHost(false);
    });
  }, [socket.id]);

  socket.on("user_joined", ({ name, userId: newUserId, hostId }) => {
    if (newUserId !== socket.id) {
      toast.success(`New User Joined ${name}`);
    }
    setIsHost(hostId === socket.id);
  });

  socket.on("disconnect", () => {
    console.log("socket.disconnected", socket.id, userId);
  });

  socket.on("host_changed", ({ hostId: newHostId }) => {
    console.log("Host Changed");
    if (newHostId === socket.id) {
      toast.success("You are now the host");
    }
    setIsHost(newHostId === socket.id);
  });

  socket.on("user_left", () => {
    toast.error("User Left");
  });

  const userLeft = () => {
    socket.emit("user_leaving_room", { roomId, userId: socket.id });
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
            name={searchParams.get("name")}
            isHost={isHost}
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
        <GuessString isHost={isHost} />
        {userId !== null && (
          <VideoStreaming socket={socket} hostId={userId} isHost={isHost} />
        )}
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
