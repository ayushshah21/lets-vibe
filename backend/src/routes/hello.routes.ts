import express, { Router } from 'express';
import { helloWorld } from '../controllers/hello.controller';

const router: Router = express.Router();

// GET /api/hello
router.get('/', helloWorld);

export default router; 