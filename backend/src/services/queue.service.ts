import prisma from '../lib/prisma';
import { QueueItem, Song } from '@prisma/client';
import { SongService, CreateSongInput } from './song.service';

const songService = new SongService();

export interface QueueItemWithSong extends QueueItem {
    song: Song;
}

/**
 * Service for managing the song queue
 */
export class QueueService {
    /**
     * Add a song to the queue
     */
    async addToQueue(
        sessionId: string,
        songData: CreateSongInput,
        voterId?: string
    ): Promise<QueueItemWithSong> {
        // First ensure the song exists in our database
        const song = await songService.createOrGetSong(songData);

        // Check if this song is already in the queue for this session
        const existingQueueItem = await prisma.queueItem.findFirst({
            where: {
                sessionId,
                songId: song.id,
                played: false,
            },
            include: {
                song: true,
            },
        });

        // If the song is already in the queue, just return it
        if (existingQueueItem) {
            // If a voter ID was provided and they haven't voted yet, add their vote
            if (voterId && !existingQueueItem.voterIds.includes(voterId)) {
                return this.upvote(existingQueueItem.id, voterId);
            }
            return existingQueueItem;
        }

        // Create a new queue item
        const queueItem = await prisma.queueItem.create({
            data: {
                sessionId,
                songId: song.id,
                votes: voterId ? 1 : 0,
                voterIds: voterId ? [voterId] : [],
            },
            include: {
                song: true,
            },
        });

        return queueItem;
    }

    /**
     * Get the current queue for a session
     */
    async getQueue(sessionId: string, includePlayedSongs = false): Promise<QueueItemWithSong[]> {
        return prisma.queueItem.findMany({
            where: {
                sessionId,
                played: includePlayedSongs ? undefined : false,
            },
            include: {
                song: true,
            },
            orderBy: {
                votes: 'desc',
            },
        });
    }

    /**
     * Get a specific queue item
     */
    async getQueueItem(id: string): Promise<QueueItemWithSong | null> {
        return prisma.queueItem.findUnique({
            where: { id },
            include: {
                song: true,
            },
        });
    }

    /**
     * Upvote a song in the queue
     */
    async upvote(queueItemId: string, voterId: string): Promise<QueueItemWithSong> {
        const queueItem = await prisma.queueItem.findUnique({
            where: { id: queueItemId },
            include: { song: true },
        });

        if (!queueItem) {
            throw new Error('Queue item not found');
        }

        // Check if this user has already voted
        if (queueItem.voterIds.includes(voterId)) {
            return queueItem;
        }

        // Add the vote
        return prisma.queueItem.update({
            where: { id: queueItemId },
            data: {
                votes: queueItem.votes + 1,
                voterIds: [...queueItem.voterIds, voterId],
            },
            include: {
                song: true,
            },
        });
    }

    /**
     * Remove a vote from a song in the queue
     */
    async removeVote(queueItemId: string, voterId: string): Promise<QueueItemWithSong> {
        const queueItem = await prisma.queueItem.findUnique({
            where: { id: queueItemId },
            include: { song: true },
        });

        if (!queueItem) {
            throw new Error('Queue item not found');
        }

        // Check if this user has voted
        if (!queueItem.voterIds.includes(voterId)) {
            return queueItem;
        }

        // Remove the vote
        return prisma.queueItem.update({
            where: { id: queueItemId },
            data: {
                votes: queueItem.votes - 1,
                voterIds: queueItem.voterIds.filter(id => id !== voterId),
            },
            include: {
                song: true,
            },
        });
    }

    /**
     * Mark a song as played
     */
    async markAsPlayed(queueItemId: string): Promise<QueueItemWithSong> {
        return prisma.queueItem.update({
            where: { id: queueItemId },
            data: { played: true },
            include: {
                song: true,
            },
        });
    }

    /**
     * Get the next song to play (highest voted unplayed song)
     */
    async getNextSong(sessionId: string): Promise<QueueItemWithSong | null> {
        return prisma.queueItem.findFirst({
            where: {
                sessionId,
                played: false,
            },
            orderBy: {
                votes: 'desc',
            },
            include: {
                song: true,
            },
        });
    }

    /**
     * Remove a song from the queue
     */
    async removeFromQueue(queueItemId: string): Promise<QueueItemWithSong> {
        return prisma.queueItem.delete({
            where: { id: queueItemId },
            include: {
                song: true,
            },
        });
    }
} 