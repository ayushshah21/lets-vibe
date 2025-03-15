import prisma from '../lib/prisma';
import { Song } from '@prisma/client';

export interface CreateSongInput {
    id: string; // Spotify track ID
    title: string;
    artist: string;
    albumArt: string;
    uri: string;
    durationMs: number;
}

/**
 * Service for managing songs
 */
export class SongService {
    /**
     * Create a new song or get existing one
     */
    async createOrGetSong(data: CreateSongInput): Promise<Song> {
        // Check if song already exists
        const existingSong = await prisma.song.findUnique({
            where: { id: data.id },
        });

        if (existingSong) {
            return existingSong;
        }

        // Create new song
        return prisma.song.create({
            data: {
                id: data.id,
                title: data.title,
                artist: data.artist,
                albumArt: data.albumArt,
                uri: data.uri,
                durationMs: data.durationMs,
            },
        });
    }

    /**
     * Get a song by ID
     */
    async getSong(id: string): Promise<Song | null> {
        return prisma.song.findUnique({
            where: { id },
        });
    }

    /**
     * Get multiple songs by IDs
     */
    async getSongsByIds(ids: string[]): Promise<Song[]> {
        return prisma.song.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });
    }
} 