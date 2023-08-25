import { useState } from "react";

export const NewUser = (props) => {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState(2);

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
