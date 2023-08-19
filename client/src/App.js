import "./App.css";
import io from "socket.io-client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameArea from "./components/MainPage";
import Room from "./components/Room";

function App() {
  return (
    <div className="App">
      <script src="https://unpkg.com/peerjs@1.4.7/dist/peerjs.min.js"></script>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Room />} />
          <Route path="game" element={<GameArea />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
