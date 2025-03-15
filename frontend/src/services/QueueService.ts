import { getUserId, setUserId } from '../utils/userIdentification';

interface Song {
    id: string;
    title: string;
    artist: string;
    albumArt: string;
    uri: string;
    durationMs: number;
}

interface QueueItem {
    id: string;
    votes: number;
    played: boolean;
    addedAt: string;
    updatedAt: string;
    song: Song;
    voterIds: string[];
}

class QueueService {
    private apiUrl = 'http://localhost:8888/api';

    /**
     * Get the queue for a session
     */
    async getQueue(sessionId: string, includePlayedSongs = false): Promise<QueueItem[]> {
        try {
            const url = new URL(`${this.apiUrl}/queue/${sessionId}`);
            if (includePlayedSongs) {
                url.searchParams.append('includePlayedSongs', 'true');
            }

            const response = await fetch(url.toString(), {
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch queue');
            }

            this.checkUserIdHeader(response);
            return response.json();
        } catch (error) {
            console.error('Error fetching queue:', error);
            throw error;
        }
    }

    /**
     * Add a song to the queue
     */
    async addToQueue(sessionId: string, song: Song): Promise<QueueItem> {
        try {
            const response = await fetch(`${this.apiUrl}/queue/${sessionId}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    song,
                    voterId: getUserId(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add song to queue');
            }

            this.checkUserIdHeader(response);
            return response.json();
        } catch (error) {
            console.error('Error adding song to queue:', error);
            throw error;
        }
    }

    /**
     * Upvote a song in the queue
     */
    async upvote(sessionId: string, queueItemId: string): Promise<QueueItem> {
        try {
            const response = await fetch(`${this.apiUrl}/queue/${sessionId}/items/${queueItemId}/upvote`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    voterId: getUserId(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to upvote song');
            }

            this.checkUserIdHeader(response);
            return response.json();
        } catch (error) {
            console.error('Error upvoting song:', error);
            throw error;
        }
    }

    /**
     * Remove a vote from a song in the queue
     */
    async removeVote(sessionId: string, queueItemId: string): Promise<QueueItem> {
        try {
            const response = await fetch(`${this.apiUrl}/queue/${sessionId}/items/${queueItemId}/downvote`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    voterId: getUserId(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to remove vote');
            }

            this.checkUserIdHeader(response);
            return response.json();
        } catch (error) {
            console.error('Error removing vote:', error);
            throw error;
        }
    }

    /**
     * Get the next song to play
     */
    async getNextSong(sessionId: string): Promise<QueueItem | null> {
        try {
            const response = await fetch(`${this.apiUrl}/queue/${sessionId}/next`, {
                headers: this.getHeaders(),
            });

            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                throw new Error('Failed to get next song');
            }

            this.checkUserIdHeader(response);
            return response.json();
        } catch (error) {
            console.error('Error getting next song:', error);
            throw error;
        }
    }

    /**
     * Mark a song as played
     */
    async markAsPlayed(sessionId: string, queueItemId: string): Promise<QueueItem> {
        try {
            const response = await fetch(`${this.apiUrl}/queue/${sessionId}/items/${queueItemId}/played`, {
                method: 'PUT',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to mark song as played');
            }

            this.checkUserIdHeader(response);
            return response.json();
        } catch (error) {
            console.error('Error marking song as played:', error);
            throw error;
        }
    }

    /**
     * Remove a song from the queue
     */
    async removeFromQueue(sessionId: string, queueItemId: string): Promise<QueueItem> {
        try {
            const response = await fetch(`${this.apiUrl}/queue/${sessionId}/items/${queueItemId}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to remove song from queue');
            }

            this.checkUserIdHeader(response);
            return response.json();
        } catch (error) {
            console.error('Error removing song from queue:', error);
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

export const queueService = new QueueService(); 