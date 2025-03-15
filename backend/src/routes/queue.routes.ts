import express, { Request, Response, Router, RequestHandler } from 'express';
import { QueueService } from '../services/queue.service';
import { CreateSongInput } from '../services/song.service';

const router: Router = express.Router();
const queueService = new QueueService();

// Get the queue for a session
router.get('/:sessionId', (async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const includePlayedSongs = req.query.includePlayedSongs === 'true';

        const queue = await queueService.getQueue(sessionId, includePlayedSongs);
        res.json(queue);
    } catch (error) {
        console.error('Error getting queue:', error);
        res.status(500).json({ error: 'Failed to get queue' });
    }
}) as RequestHandler);

// Add a song to the queue
router.post('/:sessionId', (async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const songData: CreateSongInput = req.body.song;
        const voterId = req.body.voterId;

        if (!songData || !songData.id || !songData.uri) {
            return res.status(400).json({ error: 'Invalid song data' });
        }

        const queueItem = await queueService.addToQueue(sessionId, songData, voterId);
        res.status(201).json(queueItem);
    } catch (error) {
        console.error('Error adding to queue:', error);
        res.status(500).json({ error: 'Failed to add to queue' });
    }
}) as RequestHandler);

// Upvote a song in the queue
router.post('/:sessionId/items/:itemId/upvote', (async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        const { voterId } = req.body;

        if (!voterId) {
            return res.status(400).json({ error: 'Voter ID is required' });
        }

        const queueItem = await queueService.upvote(itemId, voterId);
        res.json(queueItem);
    } catch (error) {
        console.error('Error upvoting:', error);
        res.status(500).json({ error: 'Failed to upvote' });
    }
}) as RequestHandler);

// Remove a vote from a song in the queue
router.post('/:sessionId/items/:itemId/downvote', (async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        const { voterId } = req.body;

        if (!voterId) {
            return res.status(400).json({ error: 'Voter ID is required' });
        }

        const queueItem = await queueService.removeVote(itemId, voterId);
        res.json(queueItem);
    } catch (error) {
        console.error('Error removing vote:', error);
        res.status(500).json({ error: 'Failed to remove vote' });
    }
}) as RequestHandler);

// Mark a song as played
router.put('/:sessionId/items/:itemId/played', (async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        const queueItem = await queueService.markAsPlayed(itemId);
        res.json(queueItem);
    } catch (error) {
        console.error('Error marking as played:', error);
        res.status(500).json({ error: 'Failed to mark as played' });
    }
}) as RequestHandler);

// Get the next song to play
router.get('/:sessionId/next', (async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const nextSong = await queueService.getNextSong(sessionId);

        if (!nextSong) {
            return res.status(404).json({ error: 'No songs in queue' });
        }

        res.json(nextSong);
    } catch (error) {
        console.error('Error getting next song:', error);
        res.status(500).json({ error: 'Failed to get next song' });
    }
}) as RequestHandler);

// Remove a song from the queue
router.delete('/:sessionId/items/:itemId', (async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        const queueItem = await queueService.removeFromQueue(itemId);
        res.json(queueItem);
    } catch (error) {
        console.error('Error removing from queue:', error);
        res.status(500).json({ error: 'Failed to remove from queue' });
    }
}) as RequestHandler);

export default router; 