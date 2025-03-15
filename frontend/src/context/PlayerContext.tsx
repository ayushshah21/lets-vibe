import React, { createContext, useContext, useReducer } from "react";

interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  votes: number;
  uri?: string;
  durationMs?: number;
}

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  volume: number;
  progress: number;
  duration: number;
  // Spotify-specific state
  deviceId: string | null;
  accessToken: string | null;
  isSpotifyReady: boolean;
}

type PlayerAction =
  | { type: "SET_CURRENT_SONG"; payload: Song | null }
  | { type: "TOGGLE_PLAY" }
  | { type: "SET_IS_PLAYING"; payload: boolean }
  | { type: "SET_QUEUE"; payload: Song[] }
  | { type: "SET_VOLUME"; payload: number }
  | { type: "SET_PROGRESS"; payload: number }
  | { type: "SET_DURATION"; payload: number }
  | { type: "NEXT_SONG" }
  | { type: "PREVIOUS_SONG" }
  // Spotify-specific actions
  | { type: "SET_DEVICE_ID"; payload: string }
  | { type: "SET_ACCESS_TOKEN"; payload: string }
  | { type: "SET_SPOTIFY_READY"; payload: boolean }
  | { type: "CLEAR_SPOTIFY_STATE" };

const initialState: PlayerState = {
  currentSong: null,
  isPlaying: false,
  queue: [],
  volume: 1,
  progress: 0,
  duration: 0,
  deviceId: null,
  accessToken: null,
  isSpotifyReady: false,
};

const playerReducer = (
  state: PlayerState,
  action: PlayerAction
): PlayerState => {
  switch (action.type) {
    case "SET_CURRENT_SONG":
      return {
        ...state,
        currentSong: action.payload,
        duration: action.payload?.durationMs
          ? action.payload.durationMs / 1000
          : 0,
        progress: 0,
      };
    case "TOGGLE_PLAY":
      return { ...state, isPlaying: !state.isPlaying };
    case "SET_IS_PLAYING":
      return { ...state, isPlaying: action.payload };
    case "SET_QUEUE":
      return { ...state, queue: action.payload };
    case "SET_VOLUME":
      return { ...state, volume: action.payload };
    case "SET_PROGRESS":
      return { ...state, progress: action.payload };
    case "SET_DURATION":
      return { ...state, duration: action.payload };
    case "NEXT_SONG": {
      const currentIndex = state.queue.findIndex(
        (song) => song.id === state.currentSong?.id
      );
      const nextSong = state.queue[currentIndex + 1] || null;
      return {
        ...state,
        currentSong: nextSong,
        progress: 0,
        duration: nextSong?.durationMs ? nextSong.durationMs / 1000 : 0,
      };
    }
    case "PREVIOUS_SONG": {
      const currentIndex = state.queue.findIndex(
        (song) => song.id === state.currentSong?.id
      );
      const previousSong = state.queue[currentIndex - 1] || null;
      return {
        ...state,
        currentSong: previousSong,
        progress: 0,
        duration: previousSong?.durationMs ? previousSong.durationMs / 1000 : 0,
      };
    }
    case "SET_DEVICE_ID":
      return { ...state, deviceId: action.payload };
    case "SET_ACCESS_TOKEN":
      return { ...state, accessToken: action.payload };
    case "SET_SPOTIFY_READY":
      return { ...state, isSpotifyReady: action.payload };
    case "CLEAR_SPOTIFY_STATE":
      return {
        ...state,
        deviceId: null,
        accessToken: null,
        isSpotifyReady: false,
      };
    default:
      return state;
  }
};

interface PlayerContextType {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  return (
    <PlayerContext.Provider value={{ state, dispatch }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
