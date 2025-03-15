import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayer } from "../context/PlayerContext";
import { spotifyService } from "../services/SpotifyService";

export const MusicPlayer = () => {
  const { state, dispatch } = usePlayer();
  const [isDragging, setIsDragging] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize Spotify playback state
  useEffect(() => {
    const initializeSpotify = async () => {
      try {
        // Get available devices
        const devices = await spotifyService.getDevices();
        const activeDevice = devices.find((d) => d.is_active);

        if (activeDevice) {
          dispatch({ type: "SET_DEVICE_ID", payload: activeDevice.id });
          dispatch({ type: "SET_SPOTIFY_READY", payload: true });

          // Get current playback state
          const playback = await spotifyService.getCurrentPlayback();
          if (playback && playback.item) {
            const currentTrack = playback.item;
            dispatch({
              type: "SET_CURRENT_SONG",
              payload: spotifyService.convertTrackToSong(currentTrack),
            });
            dispatch({
              type: "SET_IS_PLAYING",
              payload: playback.is_playing,
            });
            dispatch({
              type: "SET_PROGRESS",
              payload: playback.progress_ms / 1000,
            });
            dispatch({
              type: "SET_VOLUME",
              payload: playback.device.volume_percent / 100,
            });
          }
        }
      } catch (err) {
        console.error("Spotify initialization error:", err);
        setError(
          "Failed to initialize Spotify playback. Please ensure you have an active Spotify device."
        );
      }
    };

    if (state.accessToken) {
      initializeSpotify();
    }
  }, [state.accessToken, dispatch]);

  // Handle real-time progress updates
  useEffect(() => {
    let intervalId: number;
    let lastUpdateTime = Date.now();
    let localProgress = state.progress;

    const updateProgress = async () => {
      try {
        if (state.isPlaying && !isTransitioning) {
          // Update local progress based on elapsed time
          const now = Date.now();
          const elapsed = (now - lastUpdateTime) / 1000;
          lastUpdateTime = now;
          localProgress = Math.min(localProgress + elapsed, state.duration);

          // If we've reached the end of the song or need to check current playback
          if (localProgress >= state.duration || intervalId % 3 === 0) {
            let playback = await spotifyService.getCurrentPlayback();

            // If the song has ended, play the next highest voted song
            if (
              localProgress >= state.duration &&
              state.deviceId &&
              !isTransitioning
            ) {
              console.log(
                "[Song End] Current song ended, finding next highest voted song"
              );
              setIsTransitioning(true);

              // Get the next highest voted song from the queue
              const nextSong = state.queue
                .filter((song) => song.id !== state.currentSong?.id)
                .sort((a, b) => b.votes - a.votes)[0];

              if (nextSong) {
                try {
                  console.log(
                    "[Auto Play] Starting playback of next song:",
                    nextSong.title
                  );
                  // Play the next song
                  await spotifyService.play(state.deviceId, [nextSong.uri!]);

                  // Add delay and retry mechanism to get updated playback
                  let retryCount = 0;
                  const maxRetries = 3;

                  while (retryCount < maxRetries) {
                    // Wait for 1 second before checking playback
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    // Get fresh playback state
                    playback = await spotifyService.getCurrentPlayback();
                    console.log(
                      "[Playback Update] Attempt",
                      retryCount + 1,
                      "Retrieved state:",
                      {
                        currentTrack: playback?.item?.name,
                        isPlaying: playback?.is_playing,
                        progressMs: playback?.progress_ms,
                      }
                    );

                    // If we got the new song's playback, break the loop
                    if (playback?.item?.id === nextSong.id) {
                      console.log(
                        "[Playback Update] Successfully got new song state"
                      );
                      break;
                    }

                    retryCount++;
                    if (retryCount === maxRetries) {
                      console.log(
                        "[Playback Update] Max retries reached, using latest state"
                      );
                    }
                  }

                  // Reset transition flag after successful playback update
                  setIsTransitioning(false);
                } catch (err) {
                  console.error(
                    "[Auto Play Error] Failed to play next song:",
                    err
                  );
                  setError(
                    "Failed to play next song. Please ensure you have an active Spotify device."
                  );
                  setIsTransitioning(false);
                }
              } else {
                setIsTransitioning(false);
              }
            }

            if (playback && playback.item) {
              // If the current song has changed (either by ending or manual change)
              console.log("[Song Check] Comparing songs:", {
                currentSongId: state.currentSong?.id,
                playbackItemId: playback.item.id,
                isPlaying: playback.is_playing,
                progress: playback.progress_ms,
                isTransitioning,
              });

              if (
                !state.currentSong ||
                playback.item.id !== state.currentSong.id
              ) {
                console.log(
                  "[Song Change] Detected song change in playback state"
                );
                const newSong = spotifyService.convertTrackToSong(
                  playback.item
                );
                console.log(
                  "[UI Update] Updating player state with new song:",
                  {
                    title: newSong.title,
                    artist: newSong.artist,
                    duration: newSong.durationMs,
                    id: newSong.id,
                  }
                );

                // Update all relevant state in a single batch
                dispatch({
                  type: "SET_CURRENT_SONG",
                  payload: newSong,
                });
                dispatch({
                  type: "SET_DURATION",
                  payload: newSong.durationMs ? newSong.durationMs / 1000 : 0,
                });
                dispatch({
                  type: "SET_PROGRESS",
                  payload: playback.progress_ms / 1000,
                });
                dispatch({
                  type: "SET_IS_PLAYING",
                  payload: playback.is_playing,
                });

                // Reset local progress to match Spotify's state
                localProgress = playback.progress_ms / 1000;
                lastUpdateTime = now;
              } else {
                // Just update progress and playing state
                localProgress = playback.progress_ms / 1000;
                dispatch({
                  type: "SET_PROGRESS",
                  payload: localProgress,
                });
                dispatch({
                  type: "SET_IS_PLAYING",
                  payload: playback.is_playing,
                });
              }
            } else {
              console.log("[Playback Check] No active playback or track found");
            }
          } else {
            // Update UI with local progress
            dispatch({
              type: "SET_PROGRESS",
              payload: localProgress,
            });
          }
        }
      } catch (err) {
        console.error("Failed to update progress:", err);
      }
    };

    if (state.isPlaying && !isDragging) {
      intervalId = window.setInterval(updateProgress, 1000);
      lastUpdateTime = Date.now();
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [
    state.isPlaying,
    isDragging,
    state.duration,
    dispatch,
    state.progress,
    state.currentSong,
    state.queue,
    isTransitioning,
  ]);

  const handleProgressClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      if (progressBarRef.current && state.duration) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const width = rect.width;
        const progress = (x / width) * state.duration;

        // Update UI immediately
        dispatch({
          type: "SET_PROGRESS",
          payload: progress,
        });

        try {
          await spotifyService.seek(Math.round(progress * 1000));
          // Verify the seek was successful
          const playback = await spotifyService.getCurrentPlayback();
          if (playback) {
            dispatch({
              type: "SET_PROGRESS",
              payload: playback.progress_ms / 1000,
            });
          }
        } catch (err) {
          console.error("Seek error:", err);
          setError(
            "Failed to seek position. Please ensure you have an active Spotify device."
          );
        }
      }
    },
    [state.duration, dispatch]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    async (e: MouseEvent) => {
      if (isDragging && progressBarRef.current && state.duration) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const width = rect.width;
        const progress = (x / width) * state.duration;

        // Update UI immediately
        dispatch({
          type: "SET_PROGRESS",
          payload: progress,
        });

        try {
          await spotifyService.seek(Math.round(progress * 1000));
          // Get the current playback state to ensure we're in sync
          const playback = await spotifyService.getCurrentPlayback();
          if (playback) {
            // If the song has changed, update the state
            if (playback.item && playback.item.id !== state.currentSong?.id) {
              dispatch({
                type: "SET_CURRENT_SONG",
                payload: spotifyService.convertTrackToSong(playback.item),
              });
            }
            dispatch({
              type: "SET_PROGRESS",
              payload: playback.progress_ms / 1000,
            });
            dispatch({
              type: "SET_IS_PLAYING",
              payload: playback.is_playing,
            });
          }
        } catch (err) {
          console.error("Seek error:", err);
          setError(
            "Failed to seek position. Please ensure you have an active Spotify device."
          );
        }
        setIsDragging(false);
      }
    },
    [isDragging, state.duration, dispatch, state.currentSong]
  );

  // Set up event listeners for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && progressBarRef.current && state.duration) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const progress = (x / width) * state.duration;
        dispatch({
          type: "SET_PROGRESS",
          payload: Math.max(0, Math.min(progress, state.duration)),
        });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      handleDragEnd(e);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, state.duration, dispatch, handleDragEnd]);

  const handlePlayPause = async () => {
    try {
      if (state.isPlaying) {
        await spotifyService.pause();
        dispatch({ type: "SET_IS_PLAYING", payload: false });
      } else if (state.deviceId && state.currentSong?.uri) {
        const position = Math.round(state.progress * 1000);
        await spotifyService.play(
          state.deviceId,
          [state.currentSong.uri],
          position
        );
        dispatch({ type: "SET_IS_PLAYING", payload: true });
      }
    } catch (err) {
      console.error("Playback control error:", err);
      setError(
        "Failed to control playback. Please ensure you have an active Spotify device."
      );
    }
  };

  const handlePrevious = async () => {
    try {
      await spotifyService.previous();
      // Get the updated playback state after switching songs
      const playback = await spotifyService.getCurrentPlayback();
      if (playback && playback.item) {
        const newSong = spotifyService.convertTrackToSong(playback.item);
        // Update all relevant state in a single batch
        dispatch({
          type: "SET_CURRENT_SONG",
          payload: newSong,
        });
        dispatch({
          type: "SET_DURATION",
          payload: newSong.durationMs ? newSong.durationMs / 1000 : 0,
        });
        dispatch({
          type: "SET_PROGRESS",
          payload: playback.progress_ms / 1000,
        });
        dispatch({
          type: "SET_IS_PLAYING",
          payload: playback.is_playing,
        });
      }
    } catch (err) {
      console.error("Previous track error:", err);
      setError(
        "Failed to play previous track. Please ensure you have an active Spotify device."
      );
    }
  };

  const handleNext = async () => {
    try {
      await spotifyService.next();
      // Get the updated playback state after switching songs
      const playback = await spotifyService.getCurrentPlayback();
      if (playback && playback.item) {
        const newSong = spotifyService.convertTrackToSong(playback.item);
        // Update all relevant state in a single batch
        dispatch({
          type: "SET_CURRENT_SONG",
          payload: newSong,
        });
        dispatch({
          type: "SET_DURATION",
          payload: newSong.durationMs ? newSong.durationMs / 1000 : 0,
        });
        dispatch({
          type: "SET_PROGRESS",
          payload: playback.progress_ms / 1000,
        });
        dispatch({
          type: "SET_IS_PLAYING",
          payload: playback.is_playing,
        });
      }
    } catch (err) {
      console.error("Next track error:", err);
      setError(
        "Failed to play next track. Please ensure you have an active Spotify device."
      );
    }
  };

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    try {
      await spotifyService.setVolume(volume);
      dispatch({ type: "SET_VOLUME", payload: volume });
    } catch (err) {
      console.error("Volume control error:", err);
      setError(
        "Failed to change volume. Please ensure you have an active Spotify device."
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!state.currentSong) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/5 p-4 z-50"
    >
      {error && (
        <div className="absolute top-0 left-0 right-0 transform -translate-y-full">
          <div className="bg-red-500/80 text-white text-sm p-2 text-center">
            {error}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div
        ref={progressBarRef}
        className="absolute top-0 left-0 right-0 h-1 bg-white/10 cursor-pointer transform -translate-y-full"
        onClick={handleProgressClick}
        onMouseDown={handleDragStart}
      >
        <div
          className="h-full bg-purple-500"
          style={{ width: `${(state.progress / state.duration) * 100}%` }}
        />
        <div className="absolute -top-2 text-xs text-white/40 left-2">
          {formatTime(state.progress)}
        </div>
        <div className="absolute -top-2 text-xs text-white/40 right-2">
          {formatTime(state.duration)}
        </div>
        {isDragging && (
          <div
            className="absolute top-0 h-3 w-3 bg-purple-400 rounded-full -translate-y-1"
            style={{ left: `${(state.progress / state.duration) * 100}%` }}
          />
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Song Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <img
            src={state.currentSong.albumArt}
            alt={`${state.currentSong.title} album art`}
            className="w-12 h-12 rounded-lg object-cover ring-1 ring-white/10"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium truncate">
              {state.currentSong.title}
            </h4>
            <p className="text-white/60 text-sm truncate">
              {state.currentSong.artist}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevious}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={handlePlayPause}
            className="p-3 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          >
            {state.isPlaying ? (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </button>

          <button
            onClick={handleNext}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Volume Control */}
          <div className="relative">
            <button
              onClick={() => setShowVolume(!showVolume)}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l3.75-3.75M12 18l-3.75-3.75M12 6L8.25 9.75M12 6l3.75 3.75"
                />
              </svg>
            </button>

            <AnimatePresence>
              {showVolume && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-[calc(100%+1rem)] right-0 z-[60]"
                >
                  <div className="bg-black/80 backdrop-blur-xl rounded-lg p-3 shadow-xl">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={state.volume}
                      onChange={handleVolumeChange}
                      className="w-32 accent-purple-500"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
