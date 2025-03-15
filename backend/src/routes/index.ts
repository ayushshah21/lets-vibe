import express, { Router } from 'express';
import helloRoutes from './hello.routes';
import spotifyRoutes from './spotify.routes';

const router: Router = express.Router();

// Register all routes
router.use('/hello', helloRoutes);
router.use('/spotify', spotifyRoutes);

export default router; 