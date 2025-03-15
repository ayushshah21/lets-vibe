import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import { PlayerProvider } from "./context/PlayerContext";
import { MusicPlayer } from "./components/MusicPlayer";
import SpotifyTest from "./components/SpotifyTest";
import "./App.css";

function App() {
  return (
    <PlayerProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<Dashboard />} />
          <Route path="/spotify-test" element={<SpotifyTest />} />
        </Routes>
        <MusicPlayer />
      </Router>
    </PlayerProvider>
  );
}

export default App;
