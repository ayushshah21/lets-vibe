# Spotify API Integration Guide

This guide provides information and code examples for integrating Spotify functionality into your "Let's Vibe" party playlist app.

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
    - [Client Credentials Flow](#client-credentials-flow)
    - [Authorization Code Flow](#authorization-code-flow)
    - [Implicit Grant Flow](#implicit-grant-flow)
3. [Searching for Tracks](#searching-for-tracks)
4. [Playback Control](#playback-control)
5. [User Playlists](#user-playlists)
6. [Recommendations](#recommendations)
7. [Common Error Handling](#common-error-handling)
8. [Rate Limits](#rate-limits)
9. [SDK vs REST API](#sdk-vs-rest-api)

## API Overview

Spotify's Web API provides a RESTful interface for accessing Spotify data and functionality, including retrieving track details, searching for music, controlling playback, and managing playlists.

**Base URL:** `https://api.spotify.com/v1`

### Key Endpoints

- Authentication: `https://accounts.spotify.com/api/token`
- Search: `/search`
- Tracks: `/tracks`
- Player: `/me/player`
- Playlists: `/playlists`
- Recommendations: `/recommendations`

## Authentication

Before using the Spotify API, you need to register your app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) to get a Client ID and Client Secret.

There are three main authentication flows:

### Client Credentials Flow

Best for server-to-server requests that don't need user data access.

```typescript
// Client Credentials Flow Example
async function getClientCredentialsToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });
  
  const data = await response.json();
  return data.access_token;
}
```

### Authorization Code Flow

Best for long-term access with user data. Includes a refresh token for getting new access tokens.

```typescript
// Step 1: Redirect to authorization page
function redirectToSpotifyAuthorize() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.REDIRECT_URI);
  const scopes = encodeURIComponent('user-read-private user-read-email user-modify-playback-state user-read-playback-state streaming');
  
  window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
}

// Step 2: Exchange code for tokens
async function getTokenFromCode(code: string) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.REDIRECT_URI;
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`
  });
  
  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in
  };
}

// Step 3: Use refresh token to get new access tokens
async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`
  });
  
  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in
  };
}
```

### Implicit Grant Flow

Best for browser-based applications without a server component.

```typescript
function redirectToSpotifyImplicitGrant() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.REDIRECT_URI);
  const scopes = encodeURIComponent('user-read-private user-read-email user-modify-playback-state user-read-playback-state streaming');
  
  window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}`;
}

// The access token will be returned in the URL fragment 
function getAccessTokenFromUrl() {
  const fragment = window.location.hash.substr(1);
  const params = new URLSearchParams(fragment);
  return {
    accessToken: params.get('access_token'),
    expiresIn: params.get('expires_in')
  };
}
```

## Searching for Tracks

The search endpoint allows you to find tracks, albums, artists, or playlists that match a keyword string.

```typescript
// Search for tracks
async function searchTracks(query: string, accessToken: string) {
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  
  const data = await response.json();
  return data.tracks.items;
}
```

Response example:

```json
{
  "tracks": {
    "items": [
      {
        "id": "4iV5W9uYEdYUVa79Axb7Rh",
        "name": "Bohemian Rhapsody",
        "artists": [
          {
            "id": "1dfeR4HaWDbWqFHLkxsg1d",
            "name": "Queen"
          }
        ],
        "album": {
          "id": "6i6folBtxKV28WX3msQ4FE",
          "name": "A Night At The Opera",
          "images": [
            {
              "url": "https://i.scdn.co/image/ab67616d0000b273e8b066f70c206551210d902b",
              "height": 640,
              "width": 640
            }
          ]
        },
        "duration_ms": 354947,
        "external_urls": {
          "spotify": "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh"
        }
      }
    ]
  }
}
```

## Playback Control

The Web Playback SDK allows you to create a Spotify player in your web app and control it.

First, include the SDK in your HTML:

```html
<script src="https://sdk.scdn.co/spotify-player.js"></script>
```

Initialize the player:

```typescript
// Initialize Spotify Web Playback SDK
window.onSpotifyWebPlaybackSDKReady = () => {
  const player = new Spotify.Player({
    name: "Let's Vibe Player",
    getOAuthToken: cb => { cb(accessToken); }
  });

  // Error handling
  player.addListener('initialization_error', ({ message }) => { console.error(message); });
  player.addListener('authentication_error', ({ message }) => { console.error(message); });
  player.addListener('account_error', ({ message }) => { console.error(message); });
  player.addListener('playback_error', ({ message }) => { console.error(message); });

  // Playback status updates
  player.addListener('player_state_changed', state => {
    console.log(state);
    // You can update your UI here
  });

  // Ready
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    // Save the device ID to use with the REST API
  });

  // Connect to the player
  player.connect();
};
```

Control playback using the Web Playback SDK:

```typescript
// Play a track
async function playTrack(deviceId: string, trackUri: string, accessToken: string) {
  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uris: [trackUri]
    })
  });
}

// Pause playback
async function pausePlayback(accessToken: string) {
  await fetch('https://api.spotify.com/v1/me/player/pause', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
}

// Skip to next track
async function skipToNext(accessToken: string) {
  await fetch('https://api.spotify.com/v1/me/player/next', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
}

// Skip to previous track
async function skipToPrevious(accessToken: string) {
  await fetch('https://api.spotify.com/v1/me/player/previous', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
}

// Set volume (0-100)
async function setVolume(volumePercent: number, accessToken: string) {
  await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volumePercent}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
}

// Seek to position (in milliseconds)
async function seekToPosition(positionMs: number, accessToken: string) {
  await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${positionMs}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
}
```

## User Playlists

Get user's playlists and manage them.

```typescript
// Get user's playlists
async function getUserPlaylists(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  const data = await response.json();
  return data.items;
}

// Create a new playlist
async function createPlaylist(userId: string, name: string, description: string, isPublic: boolean, accessToken: string) {
  const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      description,
      public: isPublic
    })
  });
  
  return await response.json();
}

// Add tracks to a playlist
async function addTracksToPlaylist(playlistId: string, trackUris: string[], accessToken: string) {
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uris: trackUris
    })
  });
  
  return await response.json();
}
```

## Recommendations

Get track recommendations based on seed tracks, artists, or genres.

```typescript
// Get recommendations
async function getRecommendations(
  seedArtists: string[],  // Array of Spotify artist IDs
  seedTracks: string[],   // Array of Spotify track IDs
  seedGenres: string[],   // Array of genres
  accessToken: string
) {
  // Format the seed parameters
  const artistParam = seedArtists.length > 0 ? `seed_artists=${seedArtists.join(',')}` : '';
  const trackParam = seedTracks.length > 0 ? `seed_tracks=${seedTracks.join(',')}` : '';
  const genreParam = seedGenres.length > 0 ? `seed_genres=${seedGenres.join(',')}` : '';
  
  // Combine parameters
  const params = [artistParam, trackParam, genreParam].filter(Boolean).join('&');
  
  const response = await fetch(`https://api.spotify.com/v1/recommendations?${params}&limit=10`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  const data = await response.json();
  return data.tracks;
}

// Get available genres for recommendations
async function getAvailableGenres(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  const data = await response.json();
  return data.genres;
}
```

## Common Error Handling

The Spotify API uses standard HTTP status codes.

```typescript
async function makeSpotifyRequest(url: string, options: RequestInit, accessToken: string) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    // Handle common error cases
    if (response.status === 401) {
      // Access token expired, refresh it
      const newToken = await refreshAccessToken(refreshToken);
      // Retry the request with the new token
      return makeSpotifyRequest(url, options, newToken.accessToken);
    }
    
    if (response.status === 429) {
      // Rate limited, get the retry-after header
      const retryAfter = response.headers.get('Retry-After') || '1';
      // Wait for the specified time and retry
      await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
      return makeSpotifyRequest(url, options, accessToken);
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Spotify API error: ${error.error.message}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Spotify request failed:', error);
    throw error;
  }
}
```

## Rate Limits

Spotify API has rate limits that vary based on the endpoint. In general:

- Most API calls have a rate limit of 429 requests per 30 seconds.
- Burst requests have a rate limit of 500 requests per 30 seconds.
- The `Retry-After` header will tell you how long to wait if you hit the rate limit.

## SDK vs REST API

Two primary methods to interact with Spotify:

1. **Web API (REST)**: For server-side operations like searching, fetching playlists, etc.
2. **Web Playback SDK**: For client-side playback in the browser

### Web API Integration Example

```typescript
// Create a class to handle Spotify API calls
class SpotifyService {
  private accessToken: string;
  private expiresAt: number;
  private refreshToken: string;
  
  constructor() {
    // Initialize from storage or set to empty
    this.accessToken = localStorage.getItem('spotify_access_token') || '';
    this.expiresAt = parseInt(localStorage.getItem('spotify_expires_at') || '0');
    this.refreshToken = localStorage.getItem('spotify_refresh_token') || '';
  }
  
  async getValidToken() {
    // Check if token needs refreshing (expire with 5 min buffer)
    if (Date.now() > this.expiresAt - 300000 && this.refreshToken) {
      await this.refreshAccessToken();
    }
    return this.accessToken;
  }
  
  async refreshAccessToken() {
    try {
      const result = await refreshAccessToken(this.refreshToken);
      this.accessToken = result.accessToken;
      this.expiresAt = Date.now() + (result.expiresIn * 1000);
      
      // Save to localStorage
      localStorage.setItem('spotify_access_token', this.accessToken);
      localStorage.setItem('spotify_expires_at', this.expiresAt.toString());
      
      return this.accessToken;
    } catch (error) {
      console.error('Failed to refresh token', error);
      // Clear tokens and redirect to login
      this.clearTokens();
      window.location.href = '/login';
    }
  }
  
  clearTokens() {
    this.accessToken = '';
    this.expiresAt = 0;
    this.refreshToken = '';
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_expires_at');
    localStorage.removeItem('spotify_refresh_token');
  }
  
  async searchTracks(query: string) {
    const token = await this.getValidToken();
    return searchTracks(query, token);
  }
  
  async playTrack(deviceId: string, trackUri: string) {
    const token = await this.getValidToken();
    return playTrack(deviceId, trackUri, token);
  }
  
  // Add more methods for other API calls
}
```

### Web Playback SDK Integration Example

```tsx
// React component for Spotify player
import React, { useEffect, useState } from 'react';

interface SpotifyPlayerProps {
  accessToken: string;
  onPlayerStateChanged: (state: any) => void;
  onPlayerReady: (deviceId: string) => void;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ 
  accessToken, 
  onPlayerStateChanged,
  onPlayerReady
}) => {
  const [player, setPlayer] = useState<any>(null);
  
  useEffect(() => {
    // Load the Spotify Web Playback SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    
    document.body.appendChild(script);
    
    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new Spotify.Player({
        name: "Let's Vibe Player",
        getOAuthToken: cb => { cb(accessToken); }
      });
      
      // Error handling
      spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Initialization error:', message);
      });
      
      spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Authentication error:', message);
      });
      
      spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error('Account error:', message);
      });
      
      spotifyPlayer.addListener('playback_error', ({ message }) => {
        console.error('Playback error:', message);
      });
      
      // Playback status updates
      spotifyPlayer.addListener('player_state_changed', state => {
        onPlayerStateChanged(state);
      });
      
      // Ready
      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        onPlayerReady(device_id);
      });
      
      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };
    
    return () => {
      // Clean up
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken, onPlayerStateChanged, onPlayerReady]);
  
  return (
    <div className="spotify-player">
      {/* Your custom player UI goes here */}
    </div>
  );
};

export default SpotifyPlayer;
```

## Full Integration Example

Here's how to integrate both the Spotify API and Web Playback SDK in a React app:

```tsx
import React, { useState, useEffect } from 'react';
import SpotifyPlayer from './SpotifyPlayer';
import { SpotifyService } from './SpotifyService';

const MusicApp: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const spotifyService = new SpotifyService();
  
  useEffect(() => {
    // Get or refresh token on component mount
    const getToken = async () => {
      const token = await spotifyService.getValidToken();
      setAccessToken(token);
    };
    
    getToken();
  }, []);
  
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await spotifyService.searchTracks(searchQuery);
      setSearchResults(results);
    }
  };
  
  const handlePlayTrack = async (track: any) => {
    if (deviceId) {
      await spotifyService.playTrack(deviceId, track.uri);
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };
  
  const handlePlayerStateChanged = (state: any) => {
    if (state) {
      setIsPlaying(!state.paused);
      if (state.track_window.current_track) {
        setCurrentTrack({
          id: state.track_window.current_track.id,
          name: state.track_window.current_track.name,
          artists: state.track_window.current_track.artists.map((a: any) => a.name).join(', '),
          albumArt: state.track_window.current_track.album.images[0]?.url
        });
      }
    }
  };
  
  const handlePlayerReady = (id: string) => {
    setDeviceId(id);
  };
  
  return (
    <div className="music-app">
      <div className="search-section">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for tracks..."
        />
        <button onClick={handleSearch}>Search</button>
        
        <div className="search-results">
          {searchResults.map(track => (
            <div 
              key={track.id} 
              className="track-item"
              onClick={() => handlePlayTrack(track)}
            >
              <img src={track.album.images[0]?.url} alt={track.name} />
              <div>
                <h3>{track.name}</h3>
                <p>{track.artists.map((a: any) => a.name).join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {accessToken && (
        <SpotifyPlayer
          accessToken={accessToken}
          onPlayerStateChanged={handlePlayerStateChanged}
          onPlayerReady={handlePlayerReady}
        />
      )}
      
      {currentTrack && (
        <div className="now-playing">
          <img src={currentTrack.albumArt} alt={currentTrack.name} />
          <div>
            <h2>{currentTrack.name}</h2>
            <p>{currentTrack.artists}</p>
          </div>
          <div className="controls">
            {/* Implement your custom controls here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicApp;
```

This guide should give you all the key information needed to integrate Spotify into your party playlist app. Remember to register your app on the Spotify Developer Dashboard and set up the proper scopes for the functionality you need. 