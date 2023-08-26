import { Button, Grid } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChatBox from "./ChatBox";
import GuessString from "./GuessString";
import VideoStreaming from "./VideoStream/index";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";
import axios from "axios";

const GameArea = () => {
  const socket = io.connect("http://localhost:3001");

  const [searchParams] = useSearchParams();
  const [isHost, setIsHost] = useState(null);
  const [userId, setUserId] = useState(null);
  const [movie, setMovie] = useState("");

  const roomId = searchParams.get("roomId");
  const navigate = useNavigate();

  useEffect(() => {
    if (isHost) getMovie();
  }, [isHost]);

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
    });
  }, [socket.id]);

  socket.on("user_joined", ({ name, userId: newUserId, hostId }) => {
    if (newUserId !== socket.id) {
      toast.success(`New User Joined ${name}`);
    }
    console.log("isHost: ", isHost);
    if (isHost) {
      console.log("emitting");
      socket.emit("movie_set", { roomId, movie });
    }
    setIsHost(hostId === socket.id);
  });

  useEffect(() => {
    if (isHost) {
      socket.emit("movie_set", { roomId, movie });
    }
  }, [movie]);

  socket.on("disconnect", () => {
    // console.log("socket.disconnected", socket.id, userId);
  });

  socket.on("host_changed", ({ hostId: newHostId }) => {
    if (newHostId === socket.id) {
      toast.success("You are now the host");
      socket.emit("movie_set", { roomId, movie });
    }
    setIsHost(newHostId === socket.id);
  });

  socket.on("user_left", () => {
    toast.error("User Left");
  });

  const userLeft = () => {
    socket.emit("user_leaving_room", { roomId, userId: socket.id });
  };

  const getMovie = async () => {
    const page = Math.floor(Math.random() * 201);
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=4b470fed996e4925f1f6757cda528d08&sort_by=popularity.desc&page=${page}&with_original_language=en`;
    const { results } = (await axios.get(url)).data;
    const movie = results[Math.floor(Math.random() * results.length)];
    setMovie(movie.original_title);
    socket.emit("movie_set", { roomId, movie: movie.original_title });
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
            movie={movie}
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
        {isHost && <GuessString isHost={isHost} movie={movie} />}
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
