import express, { Request, Response, Router, RequestHandler } from 'express';
import { SessionService, CreateSessionInput, UpdateSessionInput } from '../services/session.service';

const router: Router = express.Router();
const sessionService = new SessionService();

// Create a new session
router.post('/', (async (req: Request, res: Response) => {
    try {
        const sessionData: CreateSessionInput = req.body;

        if (!sessionData.name) {
            return res.status(400).json({ error: 'Session name is required' });
        }

        const session = await sessionService.createSession(sessionData);
        res.status(201).json(session);
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
}) as RequestHandler);

// Get a session by ID
router.get('/:id', (async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.id;
        const session = await sessionService.getSession(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json(session);
    } catch (error) {
        console.error('Error getting session:', error);
        res.status(500).json({ error: 'Failed to get session' });
    }
}) as RequestHandler);

// Update a session
router.put('/:id', (async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.id;
        const sessionData: UpdateSessionInput = req.body;

        // Check if session exists
        const existingSession = await sessionService.getSession(sessionId);
        if (!existingSession) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const updatedSession = await sessionService.updateSession(sessionId, sessionData);
        res.json(updatedSession);
    } catch (error) {
        console.error('Error updating session:', error);
        res.status(500).json({ error: 'Failed to update session' });
    }
}) as RequestHandler);

// Get all active sessions
router.get('/', (async (_req: Request, res: Response) => {
    try {
        const sessions = await sessionService.getActiveSessions();
        res.json(sessions);
    } catch (error) {
        console.error('Error getting active sessions:', error);
        res.status(500).json({ error: 'Failed to get active sessions' });
    }
}) as RequestHandler);

// Deactivate a session
router.delete('/:id', (async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.id;

        // Check if session exists
        const existingSession = await sessionService.getSession(sessionId);
        if (!existingSession) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const deactivatedSession = await sessionService.deactivateSession(sessionId);
        res.json(deactivatedSession);
    } catch (error) {
        console.error('Error deactivating session:', error);
        res.status(500).json({ error: 'Failed to deactivate session' });
    }
}) as RequestHandler);

export default router; 