import { useNavigate } from "react-router-dom";
import { PlaylistQueue } from "../components/PlaylistQueue";
import { motion } from "framer-motion";
import SpotifyAuth from "../components/SpotifyAuth";
import { usePlayer } from "../context/PlayerContext";
import { useEffect } from "react";
import { spotifyService } from "../services/SpotifyService";

const Dashboard = () => {
  const navigate = useNavigate();
  const { state, dispatch } = usePlayer();

  // Load Spotify tokens and initialize device on mount
  useEffect(() => {
    const initializeSpotify = async () => {
      const storedTokens = localStorage.getItem("spotify_tokens");
      if (storedTokens) {
        const { access_token } = JSON.parse(storedTokens);
        dispatch({ type: "SET_ACCESS_TOKEN", payload: access_token });

        try {
          // Get available devices
          const devices = await spotifyService.getDevices();
          const activeDevice = devices.find((d) => d.is_active);

          if (activeDevice) {
            dispatch({ type: "SET_DEVICE_ID", payload: activeDevice.id });
          } else if (devices.length > 0) {
            // If no active device but devices exist, use the first one
            dispatch({ type: "SET_DEVICE_ID", payload: devices[0].id });
          }
        } catch (error) {
          console.error("Failed to initialize Spotify device:", error);
        }
      }
    };

    initializeSpotify();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="flex justify-between items-center mb-12">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-6xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"
          >
            Let's Vibe
          </motion.h1>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="px-6 py-2 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 text-purple-300 transition-all duration-300 backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-purple-500/20"
          >
            Back to Home
          </motion.button>
        </div>

        {!state.accessToken ? (
          <SpotifyAuth />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="backdrop-blur-xl bg-black bg-opacity-20 rounded-3xl p-8 shadow-2xl border border-white/5 hover:border-white/10 transition-colors duration-500"
          >
            <PlaylistQueue />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
