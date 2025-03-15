import express, { Request, Response, Router, RequestHandler } from 'express';
import axios from 'axios';

const router: Router = express.Router();

// Redirect to Spotify authorization page
router.get('/login', (req: Request, res: Response) => {
    const scopes = [
        'user-read-private',
        'user-read-email',
        'user-read-playback-state',
        'user-modify-playback-state',
        'streaming'
    ].join(' ');

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    const queryParams = new URLSearchParams({
        response_type: 'code',
        client_id: clientId || '',
        scope: scopes,
        redirect_uri: redirectUri || '',
        show_dialog: 'true' // Force showing the auth dialog
    });

    res.redirect(`https://accounts.spotify.com/authorize?${queryParams.toString()}`);
});

// Handle callback from Spotify
router.get('/callback', (req: Request, res: Response) => {
    const code = req.query.code as string;
    const error = req.query.error as string;

    if (error) {
        return res.redirect('http://localhost:5173/spotify-test?error=access_denied');
    }

    if (!code) {
        return res.redirect('http://localhost:5173/spotify-test?error=missing_code');
    }

    // Exchange code for access token
    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI || '',
        }).toString(),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
        }
    })
        .then(response => {
            const { access_token, refresh_token, expires_in } = response.data;

            // Store tokens in session for future use
            if (req.session) {
                req.session.accessToken = access_token;
                req.session.refreshToken = refresh_token;
            }

            // Redirect back to the frontend with tokens in URL parameters
            // In a production app, you wouldn't pass tokens in URL, but for testing this is ok
            const redirectUrl = new URL('http://localhost:5173/spotify-test');
            redirectUrl.searchParams.append('access_token', access_token);
            if (refresh_token) {
                redirectUrl.searchParams.append('refresh_token', refresh_token);
            }
            redirectUrl.searchParams.append('expires_in', expires_in.toString());

            res.redirect(redirectUrl.toString());
        })
        .catch(error => {
            console.error('Error exchanging code for tokens:', error);
            res.redirect('http://localhost:5173/spotify-test?error=token_exchange_failed');
        });
});

// Get the current user's tokens from session
router.get('/tokens', (req: Request, res: Response) => {
    if (req.session && req.session.accessToken) {
        res.json({
            access_token: req.session.accessToken,
            refresh_token: req.session.refreshToken
        });
    } else {
        res.status(401).json({ error: 'No tokens in session' });
    }
});

// Refresh access token
router.post('/refresh', (async (req: Request, res: Response) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    try {
        const response = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refresh_token,
            }).toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(
                    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                ).toString('base64')}`,
            },
        });

        const { access_token, refresh_token: new_refresh_token } = response.data;

        // Update session if we're using it
        if (req.session) {
            req.session.accessToken = access_token;
            if (new_refresh_token) {
                req.session.refreshToken = new_refresh_token;
            }
        }

        // Return the new tokens
        res.json({
            access_token,
            refresh_token: new_refresh_token, // Spotify might provide a new refresh token
        });
    } catch (error) {
        console.error('Token refresh failed:', error);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
}) as RequestHandler);

// Simple test endpoint to verify the router is working
router.get('/test', (req: Request, res: Response) => {
    res.json({ message: 'Spotify routes are working!' });
});

export default router; 