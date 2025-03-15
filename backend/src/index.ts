import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { ensureUserId } from './middleware/userIdentification';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Vite's default port
    credentials: true,
    exposedHeaders: ['X-User-Id'] // Expose the user ID header
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret_here',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// User identification middleware
app.use(ensureUserId);

// Routes
app.use('/api', routes);

// Root path handler (for Spotify redirect URI fallback)
app.get('/', (req: Request, res: Response) => {
    // Check if this is a callback from Spotify
    if (req.query.code) {
        // Redirect to the actual callback route with the code
        return res.redirect(`/api/spotify/callback?code=${req.query.code}`);
    }

    // Otherwise, just show a simple message
    res.send('API server is running. Use /api endpoints for functionality.');
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(port, () => {
    console.log(`⚡️ Server is running at http://localhost:${port}`);
});

export default app; 