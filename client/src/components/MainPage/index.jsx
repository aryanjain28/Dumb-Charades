import { Button, Grid, Snackbar } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChatBox from "./ChatBox";
import GuessString from "./GuessString";
import VideoStreaming from "./VideoStream/index";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { Peer } from "peerjs";
import axios from "axios";

const socket = io.connect("http://localhost:3001");
const myPeer = new Peer(undefined, {
  host: "/",
  port: 3009,
  pingInterval: 100,
});

const GameArea = (props) => {
  const [searchParams] = useSearchParams();
  const [hostId, setHostId] = useState();
  const [isHost, setIsHost] = useState(false);
  const [userId, setUserId] = useState();

  const navigate = useNavigate();

  window.addEventListener("unload", (ev) => {
    ev.preventDefault();
    console.log("Unloading...");
    socket.emit("leave_room", {
      roomId: searchParams.get("roomId"),
      destroyed_peer_id: myPeer.id,
    });
  });

  window.addEventListener("beforeunload", (ev) => {
    ev.preventDefault();
    console.log("Before Unloading...");
    socket.emit("leave_room", {
      roomId: searchParams.get("roomId"),
      destroyed_peer_id: myPeer.id,
    });
  });

  useEffect(() => {
    myPeer.on("open", async (userId) => {
      socket.emit("join_room", {
        roomId: searchParams.get("roomId"),
        username: searchParams.get("user"),
        userId,
      });
      setUserId(userId);
      try {
        const { hostId } = (
          await axios.get(
            `http://localhost:3001/getHost?roomId=${searchParams.get("roomId")}`
          )
        ).data;
        setHostId(hostId);
        setIsHost(hostId === userId);
      } catch (error) {
        console.log("Something went wroing!");
      }
    });
  }, [myPeer, myPeer.on]);

  useEffect(() => {
    socket.on("host_changed", ({ hostId }) => {
      console.log("Herere host change event: ", hostId);
      setHostId(hostId);
      setIsHost(hostId === myPeer.id);
    });
  }, [socket]);

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
        <GuessString text={`Host: ${isHost} ${searchParams.get("user")}`} />
        <VideoStreaming />
      </Grid>
      <Grid item>
        <Button
          sx={{ textTransform: "none" }}
          variant="contained"
          color="error"
          onClick={() => navigate("/")}
        >
          Exit
        </Button>
      </Grid>
    </Grid>
  );
};

export default GameArea;
