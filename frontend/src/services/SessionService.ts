import { getUserId, setUserId } from '../utils/userIdentification';

interface Session {
    id: string;
    name: string;
    hostId?: string;
    deviceId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    currentSongId?: string;
}

interface CreateSessionInput {
    name: string;
    hostId?: string;
    deviceId?: string;
    accessToken?: string;
}

class SessionService {
    private apiUrl = 'http://localhost:8888/api';

    /**
     * Get all active sessions
     */
    async getSessions(): Promise<Session[]> {
        try {
            const response = await fetch(`${this.apiUrl}/sessions`, {
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch sessions');
            }

            this.checkUserIdHeader(response);
            return response.json();
        } catch (error) {
            console.error('Error fetching sessions:', error);
            throw error;
        }
    }

    /**
     * Get a session by ID
     */
    async getSession(id: string): Promise<Session> {
        try {
            const response = await fetch(`${this.apiUrl}/sessions/${id}`, {
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch session');
            }

            this.checkUserIdHeader(response);
            return response.json();
        } catch (error) {
            console.error('Error fetching session:', error);
            throw error;
        }
    }

    /**
     * Create a new session
     */
    async createSession(data: CreateSessionInput): Promise<Session> {
        try {
            const response = await fetch(`${this.apiUrl}/sessions`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to create session');
            }

            this.checkUserIdHeader(response);
            return response.json();
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    }

    /**
     * Update a session
     */
    async updateSession(id: string, data: Partial<CreateSessionInput>): Promise<Session> {
        try {
            const response = await fetch(`${this.apiUrl}/sessions/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update session');
            }

            this.checkUserIdHeader(response);
            return response.json();
        } catch (error) {
            console.error('Error updating session:', error);
            throw error;
        }
    }

    /**
     * Deactivate a session
     */
    async deactivateSession(id: string): Promise<Session> {
        try {
            const response = await fetch(`${this.apiUrl}/sessions/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to deactivate session');
            }

            this.checkUserIdHeader(response);
            return response.json();
        } catch (error) {
            console.error('Error deactivating session:', error);
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

export const sessionService = new SessionService(); 