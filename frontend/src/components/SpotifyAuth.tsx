import { useState, useEffect } from "react";

interface SpotifyTokens {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

const SpotifyAuth = () => {
  const [authStatus, setAuthStatus] = useState<string>("");
  const [tokens, setTokens] = useState<SpotifyTokens | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for tokens or error in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");
    const expiresIn = urlParams.get("expires_in");
    const errorParam = urlParams.get("error");

    // Clear URL parameters
    if (accessToken || errorParam) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (errorParam) {
      setError(`Authentication error: ${errorParam}`);
      return;
    }

    if (accessToken) {
      const tokenData: SpotifyTokens = {
        access_token: accessToken,
      };

      if (refreshToken) {
        tokenData.refresh_token = refreshToken;
      }

      if (expiresIn) {
        tokenData.expires_in = parseInt(expiresIn);
      }

      setTokens(tokenData);
      setAuthStatus("Successfully authenticated with Spotify!");

      // Store tokens in localStorage for persistence
      localStorage.setItem("spotify_tokens", JSON.stringify(tokenData));
    } else {
      // Check if we have tokens in localStorage
      const storedTokens = localStorage.getItem("spotify_tokens");
      if (storedTokens) {
        setTokens(JSON.parse(storedTokens));
        setAuthStatus("Loaded tokens from local storage.");
      }
    }
  }, []);

  const handleLogin = () => {
    // Clear any existing error
    setError(null);
    // Redirect to our backend auth endpoint
    window.location.href = "http://localhost:8888/api/spotify/login";
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("http://localhost:8888/api/spotify/test", {
        credentials: "include",
      });
      const data = await response.json();
      setAuthStatus(`Status: ${JSON.stringify(data)}`);
    } catch (error) {
      setAuthStatus(`Error: ${error}`);
    }
  };

  const checkSessionTokens = async () => {
    try {
      const response = await fetch("http://localhost:8888/api/spotify/tokens", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data);
        setAuthStatus("Retrieved tokens from server session!");
      } else {
        const errorData = await response.json();
        setAuthStatus(`Session token check: ${errorData.error}`);
      }
    } catch (error) {
      setAuthStatus(`Error checking session tokens: ${error}`);
    }
  };

  const clearTokens = () => {
    // Clear from state
    setTokens(null);
    // Clear from localStorage
    localStorage.removeItem("spotify_tokens");
    setAuthStatus("Tokens cleared from browser.");
  };

  return (
    <div className="p-4 bg-black/30 backdrop-blur-md rounded-lg border border-white/10 max-w-md mx-auto my-8">
      <h2 className="text-xl font-bold text-white mb-4">
        Spotify Authentication
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
          <p className="text-white">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleLogin}
          className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
        >
          Connect to Spotify
        </button>

        <button
          onClick={checkAuthStatus}
          className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
        >
          Check API Status
        </button>

        <button
          onClick={checkSessionTokens}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          Check Session Tokens
        </button>

        <button
          onClick={clearTokens}
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
        >
          Clear Tokens
        </button>

        {authStatus && (
          <div className="mt-4 p-3 bg-gray-800 rounded-md">
            <p className="text-white text-sm font-mono break-all">
              {authStatus}
            </p>
          </div>
        )}

        {tokens && (
          <div className="mt-4 p-3 bg-gray-800 rounded-md">
            <p className="text-white text-sm font-mono break-all">
              Access Token: {tokens.access_token?.substring(0, 20)}...
            </p>
            {tokens.refresh_token && (
              <p className="text-white text-sm font-mono break-all mt-2">
                Refresh Token: {tokens.refresh_token.substring(0, 10)}...
              </p>
            )}
            {tokens.expires_in && (
              <p className="text-white text-sm font-mono mt-2">
                Expires in: {tokens.expires_in} seconds
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyAuth;
