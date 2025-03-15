import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SongCard } from "./SongCard";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";
import { usePlayer } from "../context/PlayerContext";
import { spotifyService } from "../services/SpotifyService";

// Song type from PlayerContext
interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  votes: number;
  uri?: string;
  durationMs?: number;
}

export const PlaylistQueue = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { state: playerState, dispatch: playerDispatch } = usePlayer();

  // Effect to sync songs with player queue
  useEffect(() => {
    if (songs.length > 0) {
      playerDispatch({ type: "SET_QUEUE", payload: songs });
    }
  }, [songs, playerDispatch]);

  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const tracks = await spotifyService.searchTracks(query);
      console.log("Search results:", tracks); // Debug log
      const formattedResults = tracks.map((track) => {
        const song = spotifyService.convertTrackToSong(track);
        console.log("Formatted song:", song); // Debug log
        return song;
      });
      setSearchResults(formattedResults);
      setShowResults(true);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleAddSong = useCallback((newSong: Song) => {
    console.log("Adding song:", newSong); // Debug log
    if (!newSong.uri) {
      console.error("Cannot add song without URI:", newSong);
      return;
    }

    setSongs((prevSongs) => {
      // Check if song already exists
      if (prevSongs.some((song) => song.id === newSong.id)) {
        return prevSongs;
      }
      return [...prevSongs, newSong];
    });

    setShowResults(false);
    setSearchResults([]);
  }, []);

  const handleVote = useCallback((id: string) => {
    setSongs((prevSongs) => {
      return prevSongs
        .map((song) =>
          song.id === id ? { ...song, votes: song.votes + 1 } : song
        )
        .sort((a, b) => b.votes - a.votes);
    });
  }, []);

  const handlePlay = useCallback(
    async (song: Song) => {
      console.log("Playing song:", song);
      if (!song.uri) {
        console.error("Song URI is missing:", song);
        return;
      }
      if (!playerState.deviceId) {
        console.error("No active Spotify device found");
        return;
      }
      try {
        // If it's the same song that was playing, resume from the current position
        const position_ms =
          playerState.currentSong?.id === song.id
            ? Math.round(playerState.progress * 1000)
            : 0;

        await spotifyService.play(
          playerState.deviceId,
          [song.uri],
          position_ms
        );
        playerDispatch({ type: "SET_CURRENT_SONG", payload: song });
        playerDispatch({ type: "TOGGLE_PLAY" });
      } catch (error) {
        console.error("Failed to play song:", error);
      }
    },
    [
      playerState.deviceId,
      playerState.currentSong,
      playerState.progress,
      playerDispatch,
    ]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <div className="flex items-center gap-6 mb-10">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl font-bold text-white"
        >
          Party Playlist
        </motion.h2>
        <div className="h-10 w-px bg-purple-500/30"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 backdrop-blur-sm"
        >
          <span className="text-purple-300/70 text-lg">{songs.length}</span>
          <span className="text-purple-300/50">songs</span>
        </motion.div>
      </div>

      <div className="relative z-50 mb-8">
        <SearchBar onSearch={handleSearch} isSearching={isSearching} />
        <SearchResults
          results={searchResults}
          onAdd={handleAddSong}
          isVisible={showResults}
        />
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div className="space-y-4" layout>
          {songs.map((song, index) => (
            <motion.div
              key={song.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <SongCard
                {...(song as Required<Song>)}
                position={index + 1}
                onVote={() => handleVote(song.id)}
                onPlay={handlePlay}
                isPlaying={
                  playerState.currentSong?.id === song.id &&
                  playerState.isPlaying
                }
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
