import { Box, Button, TextField, Typography } from "@mui/material";
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

const Chat = ({ value, username, dateTime }) => {
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
        <Typography variant="caption">{username}</Typography>
      </Box>
    </Box>
  );
};

const ChatBox = (props) => {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const { socket, roomId, username } = props;

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChats((c) => [...c, data]);
    });

    // desctuctor
    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  const sendMessage = async () => {
    const date = new Date(Date.now());
    const dateTime =
      date.getHours() +
      ":" +
      (date.getMinutes() < 10 ? "0" : "") +
      date.getMinutes();

    const data = { message, username, dateTime, roomId };
    await socket.emit("send_message", data);
    setChats((c) => [...c, { message, roomId, dateTime, username: "You" }]);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="end"
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
      <Box
        display="flex"
        flexDirection="column"
        alignItems="end"
        justifyContent="end"
        overflow="scroll"
        height="100%"
        width="100%"
      >
        {chats.map(({ message, username, dateTime }) => (
          <Chat value={message} username={username} dateTime={dateTime} />
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
        />
        <Button
          type="submit"
          variant="contained"
          onClick={(e) => {
            e.preventDefault();
            sendMessage();
            setMessage("");
          }}
          sx={{ bgcolor: "#0f1c52", textTransform: "none" }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatBox;
