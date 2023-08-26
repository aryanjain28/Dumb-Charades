import { Box, Button, Dialog, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const chats = [
  "Hello",
  "Ths",
  "is",
  "an",
  "exapmle",
  "Hello",
  "Ths",
  "is",
  "an",
  "exapmle",
  "Hello",
  "Ths",
  "is",
  "an",
  "exapmle",
  "Hello",
  "Ths",
  "is",
  "an",
  "exapmle",
  "Hello",
  "Ths",
  "is",
  "an",
  "exapmle",
  "Hello",
  "Ths",
  "is",
  "an",
  "exapmle",
  "Hello",
  "Ths",
  "is",
  "an",
  "exapmle",
  "Hello",
  "Ths",
  "is",
  "an",
  "exapmle",
  "Hello",
  "Ths",
  "is",
  "an",
  "exapmle",
  "Hello",
  "Ths",
  "is",
  "an",
  "exapmle",
];

const Chat = ({ value, name, dateTime }) => {
  return (
    <Box
      m={1}
      p={1}
      border="1px gray solid"
      borderRadius={1}
      display="flex"
      flexDirection="column"
      alignItems="end"
    >
      {value && <Typography variant="body1">{value}</Typography>}
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
  const { socket, name, roomId } = props;

  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);

  socket.on("receive_message", (data) => {
    if (data.userId === socket.id) return;
    setChats((c) => [...c, data]);
  });

  socket.on("room_updated", ({ names }) => {
    console.log("HERER", names);
    setUsers((u) => [...names]);
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

  console.log(users);

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
        display="flex"
        flexDirection="column"
        alignItems="end"
        justifyContent="end"
        overflow="scroll"
        height="100%"
        width="100%"
      >
        {chats.map(({ message, name, dateTime }, i) => (
          <Chat key={i} value={message} name={name} dateTime={dateTime} />
        ))}
      </Box>
      <Box display="flex" width={1} gap={1}>
        <TextField
          fullWidth
          placeholder="Start typing..."
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          value={message}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
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
