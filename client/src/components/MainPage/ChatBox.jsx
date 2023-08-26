import { Box, TextField, Typography } from "@mui/material";
import { useState } from "react";
import s from "string-similarity";

const Chat = ({ value, name, dateTime, movie }) => {
  console.log("Chat: ", movie);
  const percent = parseInt(
    s.compareTwoStrings(movie.toLowerCase(), value) * 100
  );

  return (
    <Box
      m={1}
      p={1}
      position="relative"
      border="1px gray solid"
      borderRadius={1}
      display="flex"
      flexDirection="column"
      alignItems="end"
      gap={1}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: "100%" }}
        alignSelf="right"
        gap={2}
      >
        <Typography
          variant="caption"
          sx={{ fontSize: 10, fontWeight: 800 }}
          color={percent > 80 ? "green" : percent < 30 ? "orangered" : "orange"}
        >
          {`${percent}%`}
        </Typography>
        <Typography variant="body1">{value}</Typography>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: "100%" }}
        alignSelf="right"
        gap={2}
      >
        <Typography variant="caption">{dateTime}</Typography>
        <Typography variant="caption">{name}</Typography>
      </Box>
    </Box>
  );
};

const ChatBox = (props) => {
  const { socket, name, roomId, isHost } = props;

  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [movie, setMovie] = useState("");

  socket.on("receive_message", (data) => {
    if (data.userId === socket.id) return;
    setChats((c) => [...c, data]);
  });

  socket.on("room_updated", ({ names }) => {
    setUsers((u) => [...names]);
  });

  socket.on("set_movie", ({ movie }) => {
    console.log(movie);
    setMovie(movie);
  });

  const sendMessage = async () => {
    const date = new Date(Date.now());
    const dateTime =
      date.getHours() +
      ":" +
      (date.getMinutes() < 10 ? "0" : "") +
      date.getMinutes();

    const data = {
      userId: socket.id,
      message,
      name: name,
      dateTime,
      roomId,
    };
    socket.emit("send_message", data);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
      border="1px solid"
      borderRadius={2}
      borderColor={"lightgray"}
      boxShadow={2}
      height={950}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ width: "100%" }}
        bgcolor="#0f1c52"
        color="white"
        py={1}
      >
        <Typography sx={{ fontSize: 14 }}>{`${roomId}`}</Typography>
      </Box>
      {users.length > 0 && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="start"
          borderRadius={2}
          boxShadow={2}
          sx={{ fontSize: 13, width: "90%", my: 1 }}
        >
          <Typography
            variant="caption"
            sx={{
              borderRadius: 1,
              width: "90%",
              background: "green",
              zIndex: 0,
            }}
            color="white"
          >
            Online Members:
          </Typography>
          {users.map((name) => (
            <Typography variant="caption">{name}</Typography>
          ))}
        </Box>
      )}
      <Box
        position="relative"
        display="flex"
        flexDirection="column"
        alignItems="end"
        justifyContent="end"
        overflow="scroll"
        height="100%"
        width="100%"
      >
        {chats.map(({ message, name, dateTime }, i) => (
          <Chat
            key={i}
            value={message}
            name={name}
            dateTime={dateTime}
            movie={movie}
          />
        ))}
      </Box>
      <Box display="flex" width={1} gap={1}>
        <TextField
          fullWidth
          placeholder="Start typing..."
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          disabled={isHost}
          value={message}
          onKeyUp={(e) => {
            if (e.key === "Enter" && message) {
              e.preventDefault();
              sendMessage();
              setMessage("");
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default ChatBox;
