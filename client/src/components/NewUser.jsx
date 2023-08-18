import { useState } from "react";
import io from "socket.io-client";

const socket = io.connect("http://localhost:3001");

export const NewUser = (props) => {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState(2);

  const JoinRoom = () => {
    socket.emit("join_room", roomId);
  };

  return (
    <div>
      <h1>Dum Charades</h1>
      <input
        type="text"
        placeholder="Enter you name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <input
        type="button"
        value="Join Room"
        disabled={!(name && roomId) || roomId <= 1}
        onClick={() => JoinRoom()}
      />
    </div>
  );
};
