import express, { Request, Response, Router, RequestHandler } from 'express';
import { PlaybackService, UpdatePlaybackStateInput } from '../services/playback.service';

const router: Router = express.Router();
const playbackService = new PlaybackService();

// Get the playback state for a session
router.get('/:sessionId', (async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const playbackState = await playbackService.getPlaybackState(sessionId);

        if (!playbackState) {
            return res.status(404).json({ error: 'Playback state not found' });
        }
        res.json(playbackState);
    } catch (error) {
        console.error('Error getting playback state:', error);
        res.status(500).json({ error: 'Failed to get playback state' });
    }
}) as RequestHandler);

// Update the playback state for a session
router.put('/:sessionId', (async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const playbackData: UpdatePlaybackStateInput = req.body;

        const playbackState = await playbackService.updatePlaybackState(sessionId, playbackData);
        res.json(playbackState);
    } catch (error) {
        console.error('Error updating playback state:', error);
        res.status(500).json({ error: 'Failed to update playback state' });
    }
}) as RequestHandler);

export default router; 