import { Button, Grid, Snackbar } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChatBox from "./ChatBox";
import { VideoStream } from "./VideoStream";
import GuessString from "./GuessString";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { Peer } from "peerjs";
import axios from "axios";

const socket = io.connect("http://localhost:3001");
const myPeer = new Peer(undefined, {
  host: "/",
  port: 3009,
});

const GameArea = (props) => {
  const [searchParams] = useSearchParams();
  const [roomId, setRoomId] = useState(null);
  const [username, setUsername] = useState(null);
  const [hostId, setHostId] = useState();
  const [isHost, setIsHost] = useState(false);
  const [userId, setUserId] = useState();

  const navigate = useNavigate();

  window.removeEventListener("beforeunload", () => {
    socket.emit("leave_room", { roomId, destroyed_peer_id: myPeer.id });
  });

  useEffect(() => {
    const roomId = searchParams.get("roomId");
    setRoomId(roomId);

    const username = searchParams.get("user");
    setUsername(username);
  }, []);

  useEffect(() => {
    myPeer.on("open", async (userId) => {
      socket.emit("join_room", { roomId, username, userId });
      setUserId(userId);
      const { hostId } = (await axios.get("http://localhost:3001/getHost"))
        .data;
      setHostId(hostId);
      setIsHost(hostId === userId);
    });
  }, []);

  useEffect(() => {
    socket.on("host_changed", ({ hostId }) => {
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
          <ChatBox socket={socket} roomId={roomId} username={username} />
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
        <GuessString text={`Host: ${isHost} ${username}`} />
        {userId !== undefined && hostId !== undefined && (
          <VideoStream
            isHost={isHost}
            username={username}
            roomId={roomId}
            socket={socket}
            myPeer={myPeer}
          />
        )}
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
