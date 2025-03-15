import { getUserId, setUserId } from '../utils/userIdentification';

interface PlaybackState {
    id: string;
    sessionId: string;
    isPlaying: boolean;
    progress: number;
    volume: number;
    updatedAt: string;
}

interface UpdatePlaybackStateInput {
    isPlaying?: boolean;
    progress?: number;
    volume?: number;
}

class PlaybackService {
    private apiUrl = 'http://localhost:8888/api';

    /**
     * Get the playback state for a session
     */
    async getPlaybackState(sessionId: string): Promise<PlaybackState | null> {
        try {
            const response = await fetch(`${this.apiUrl}/playback/${sessionId}`, {
                headers: this.getHeaders(),
            });

            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch playback state');
            }

            this.checkUserIdHeader(response);
            return response.json();
        } catch (error) {
            console.error('Error fetching playback state:', error);
            throw error;
        }
    }

    /**
     * Update the playback state for a session
     */
    async updatePlaybackState(sessionId: string, data: UpdatePlaybackStateInput): Promise<PlaybackState> {
        try {
            const response = await fetch(`${this.apiUrl}/playback/${sessionId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update playback state');
            }

            this.checkUserIdHeader(response);
            return response.json();
        } catch (error) {
            console.error('Error updating playback state:', error);
            throw error;
        }
    }

    /**
     * Get headers for API requests
     */
    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        const userId = getUserId();
        if (userId) {
            headers['X-User-Id'] = userId;
        }

        return headers;
    }

    /**
     * Check for and save user ID from response headers
     */
    private checkUserIdHeader(response: Response): void {
        const userId = response.headers.get('X-User-Id');
        if (userId) {
            setUserId(userId);
        }
    }
}

export const playbackService = new PlaybackService(); 