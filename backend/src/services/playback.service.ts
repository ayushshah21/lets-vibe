import prisma from '../lib/prisma';
import { PlaybackState } from '@prisma/client';

export interface UpdatePlaybackStateInput {
    isPlaying?: boolean;
    progress?: number;
    volume?: number;
}

/**
 * Service for managing playback state
 */
export class PlaybackService {
    /**
     * Get the playback state for a session
     */
    async getPlaybackState(sessionId: string): Promise<PlaybackState | null> {
        return prisma.playbackState.findUnique({
            where: { sessionId },
        });
    }

    /**
     * Create or update the playback state for a session
     */
    async updatePlaybackState(
        sessionId: string,
        data: UpdatePlaybackStateInput
    ): Promise<PlaybackState> {
        const existingState = await prisma.playbackState.findUnique({
            where: { sessionId },
        });

        if (existingState) {
            return prisma.playbackState.update({
                where: { id: existingState.id },
                data,
            });
        }

        return prisma.playbackState.create({
            data: {
                sessionId,
                isPlaying: data.isPlaying ?? false,
                progress: data.progress ?? 0,
                volume: data.volume ?? 100,
            },
        });
    }
} 