import "./App.css";
import io from "socket.io-client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameArea from "./components/MainPage";
import Room from "./components/Room";

const socket = io.connect("http://localhost:3001");

function App() {
  return (
    <div className="App">
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
