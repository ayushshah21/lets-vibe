import express, { Router } from 'express';
import helloRoutes from './hello.routes';
import spotifyRoutes from './spotify.routes';
import sessionRoutes from './session.routes';
import queueRoutes from './queue.routes';
import playbackRoutes from './playback.routes';

const router: Router = express.Router();

// Register all routes
router.use('/hello', helloRoutes);
router.use('/spotify', spotifyRoutes);
router.use('/sessions', sessionRoutes);
router.use('/queue', queueRoutes);
router.use('/playback', playbackRoutes);

export default router; 