interface SpotifyTrack {
    uri: string;
    id: string;
    name: string;
    artists: { name: string }[];
    album: {
        images: { url: string }[];
    };
    duration_ms: number;
}

class SpotifyService {
    private getTokens(): { access_token: string; refresh_token: string } | null {
        const tokens = localStorage.getItem("spotify_tokens");
        if (!tokens) return null;
        return JSON.parse(tokens);
    }

    private async refreshAccessToken(refresh_token: string) {
        try {
            const response = await fetch("http://localhost:8888/api/spotify/refresh", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refresh_token }),
            });

            if (!response.ok) {
                throw new Error("Failed to refresh token");
            }

            const data = await response.json();
            localStorage.setItem("spotify_tokens", JSON.stringify({
                access_token: data.access_token,
                refresh_token: data.refresh_token || refresh_token // Use new refresh token if provided
            }));

            return data.access_token;
        } catch (error) {
            console.error("Token refresh failed:", error);
            localStorage.removeItem("spotify_tokens");
            window.location.href = "/dashboard"; // Redirect to trigger re-auth
            throw error;
        }
    }

    private async makeSpotifyRequest(
        endpoint: string,
        options: RequestInit = {}
    ) {
        const tokens = this.getTokens();
        if (!tokens) {
            throw new Error("No tokens found");
        }

        try {
            const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${tokens.access_token}`,
                },
            });

            // If unauthorized, try to refresh token and retry the request
            if (response.status === 401 && tokens.refresh_token) {
                const newAccessToken = await this.refreshAccessToken(tokens.refresh_token);

                // Retry the request with new token
                const retryResponse = await fetch(`https://api.spotify.com/v1${endpoint}`, {
                    ...options,
                    headers: {
                        ...options.headers,
                        Authorization: `Bearer ${newAccessToken}`,
                    },
                });

                if (!retryResponse.ok) {
                    throw new Error(`Spotify API error: ${retryResponse.statusText}`);
                }

                return retryResponse.headers.get("content-type")?.includes("application/json")
                    ? retryResponse.json()
                    : null;
            }

            if (!response.ok) {
                throw new Error(`Spotify API error: ${response.statusText}`);
            }

            return response.headers.get("content-type")?.includes("application/json")
                ? response.json()
                : null;
        } catch (error) {
            console.error("Spotify API request failed:", error);
            throw error;
        }
    }

    async getDevices(): Promise<{ id: string; name: string; is_active: boolean }[]> {
        const data = await this.makeSpotifyRequest("/me/player/devices");
        return data.devices;
    }

    async getCurrentPlayback() {
        return this.makeSpotifyRequest("/me/player");
    }

    async play(deviceId: string, uris?: string[], position_ms?: number) {
        interface PlayRequestBody {
            uris?: string[];
            position_ms?: number;
        }

        const body: PlayRequestBody = {};
        if (uris) body.uris = uris;
        if (position_ms !== undefined) body.position_ms = position_ms;

        await this.makeSpotifyRequest(`/me/player/play?device_id=${deviceId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    }

    async pause() {
        await this.makeSpotifyRequest("/me/player/pause", {
            method: "PUT",
        });
    }

    async next() {
        await this.makeSpotifyRequest("/me/player/next", {
            method: "POST",
        });
    }

    async previous() {
        await this.makeSpotifyRequest("/me/player/previous", {
            method: "POST",
        });
    }

    async seek(positionMs: number) {
        await this.makeSpotifyRequest(`/me/player/seek?position_ms=${positionMs}`, {
            method: "PUT",
        });
    }

    async setVolume(volumePercent: number) {
        await this.makeSpotifyRequest(
            `/me/player/volume?volume_percent=${Math.round(volumePercent * 100)}`,
            {
                method: "PUT",
            }
        );
    }

    async searchTracks(query: string): Promise<SpotifyTrack[]> {
        const data = await this.makeSpotifyRequest(
            `/search?q=${encodeURIComponent(query)}&type=track&limit=10`
        );
        return data.tracks.items;
    }

    // Convert Spotify track to our app's Song format
    convertTrackToSong(track: SpotifyTrack) {
        if (!track.uri) {
            throw new Error("Track URI is required");
        }

        // Use a more reliable fallback image URL
        const fallbackAlbumArt = "https://placehold.co/300x300/1DB954/ffffff?text=No+Album+Art";

        // Get the smallest available album art to reduce load times and 404s
        const albumArt = track.album.images
            .sort((a, b) => (a.url.length - b.url.length)) // Sort by URL length as a proxy for image size
            .find(img => img.url)?.url || fallbackAlbumArt;

        return {
            id: track.id,
            title: track.name,
            artist: track.artists.map((a) => a.name).join(", "),
            albumArt,
            uri: track.uri,
            durationMs: track.duration_ms,
            votes: 0,
        };
    }
}

export const spotifyService = new SpotifyService(); 