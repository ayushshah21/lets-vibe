import prisma from '../lib/prisma';
import { Session } from '@prisma/client';

export interface CreateSessionInput {
    name: string;
    hostId?: string;
    deviceId?: string;
    accessToken?: string;
}

export interface UpdateSessionInput {
    name?: string;
    hostId?: string;
    deviceId?: string;
    accessToken?: string;
    isActive?: boolean;
    currentSongId?: string | null;
}

/**
 * Service for managing listening sessions
 */
export class SessionService {
    /**
     * Create a new listening session
     */
    async createSession(data: CreateSessionInput): Promise<Session> {
        return prisma.session.create({
            data: {
                name: data.name,
                hostId: data.hostId,
                deviceId: data.deviceId,
                accessToken: data.accessToken,
            },
        });
    }

    /**
     * Get a session by ID
     */
    async getSession(id: string): Promise<Session | null> {
        return prisma.session.findUnique({
            where: { id },
        });
    }

    /**
     * Update a session
     */
    async updateSession(id: string, data: UpdateSessionInput): Promise<Session> {
        return prisma.session.update({
            where: { id },
            data,
        });
    }

    /**
     * Get all active sessions
     */
    async getActiveSessions(): Promise<Session[]> {
        return prisma.session.findMany({
            where: { isActive: true },
        });
    }

    /**
     * Set the current song for a session
     */
    async setCurrentSong(sessionId: string, songId: string | null): Promise<Session> {
        return prisma.session.update({
            where: { id: sessionId },
            data: { currentSongId: songId },
        });
    }

    /**
     * Deactivate a session
     */
    async deactivateSession(id: string): Promise<Session> {
        return prisma.session.update({
            where: { id },
            data: { isActive: false },
        });
    }
} 