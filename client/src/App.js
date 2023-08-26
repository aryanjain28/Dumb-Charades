import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameArea from "./components/MainPage";
import Room from "./components/Room";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="App">
      <script src="https://unpkg.com/peerjs@1.4.7/dist/peerjs.min.js"></script>

      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          theme="dark"
        />
        <Routes>
          <Route path="/" element={<Room />} />
          <Route path="game" element={<GameArea />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
