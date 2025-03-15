import { useState } from "react";

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    images: { url: string }[];
  };
  uri: string;
}

const SpotifyTest = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Get access token from localStorage
  const getAccessToken = () => {
    const tokens = localStorage.getItem("spotify_tokens");
    if (!tokens) return null;
    return JSON.parse(tokens).access_token;
  };

  const handleSearch = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setError("No access token found. Please connect to Spotify first.");
      return;
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          searchQuery
        )}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setSearchResults(data.tracks.items);
      setError(null);
    } catch (err) {
      setError(`Error searching tracks: ${err}`);
      setSearchResults([]);
    }
  };

  const playTrack = async (trackUri: string) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setError("No access token found. Please connect to Spotify first.");
      return;
    }

    try {
      // First get available devices
      const devicesResponse = await fetch(
        "https://api.spotify.com/v1/me/player/devices",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!devicesResponse.ok) {
        throw new Error(`Failed to get devices: ${devicesResponse.statusText}`);
      }

      const devicesData = await devicesResponse.json();
      if (!devicesData.devices.length) {
        setError(
          "No active Spotify devices found. Please open Spotify on any device."
        );
        return;
      }

      // Use the first available device
      const deviceId = devicesData.devices[0].id;

      // Start playback on the device
      const playResponse = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: [trackUri],
          }),
        }
      );

      if (!playResponse.ok) {
        throw new Error(`Failed to start playback: ${playResponse.statusText}`);
      }

      setIsPlaying(true);
      setError(null);
    } catch (err) {
      setError(`Error playing track: ${err}`);
    }
  };

  const togglePlayback = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setError("No access token found. Please connect to Spotify first.");
      return;
    }

    try {
      const endpoint = isPlaying ? "pause" : "play";
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/${endpoint}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${endpoint}: ${response.statusText}`);
      }

      setIsPlaying(!isPlaying);
      setError(null);
    } catch (err) {
      setError(`Error toggling playback: ${err}`);
    }
  };

  return (
    <div className="p-4 bg-black/30 backdrop-blur-md rounded-lg border border-white/10 max-w-2xl mx-auto my-8">
      <h2 className="text-xl font-bold text-white mb-4">
        Spotify Test Features
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
          <p className="text-white">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Search Section */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a song..."
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
          >
            Search
          </button>
        </div>

        {/* Search Results */}
        <div className="space-y-2">
          {searchResults.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-4 p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
              onClick={() => playTrack(track.uri)}
            >
              <img
                src={track.album.images[0]?.url}
                alt={track.name}
                className="w-12 h-12 rounded-md"
              />
              <div className="flex-1">
                <h3 className="text-white font-medium">{track.name}</h3>
                <p className="text-white/60 text-sm">
                  {track.artists.map((a) => a.name).join(", ")}
                </p>
              </div>
              <button className="p-2 text-white/60 hover:text-white">
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
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Playback Controls */}
        <div className="flex justify-center">
          <button
            onClick={togglePlayback}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpotifyTest;
