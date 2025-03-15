import { Request, Response, NextFunction } from 'express';
import { generateUserId, isValidUserId } from '../utils/userIdGenerator';

/**
 * Middleware to ensure each request has a user ID
 * If no user ID is provided in the request, a new one is generated
 */
export function ensureUserId(req: Request, res: Response, next: NextFunction) {
    // Check for user ID in headers
    const userId = req.headers['x-user-id'] as string;

    if (userId && isValidUserId(userId)) {
        // If valid user ID is provided, attach it to the request
        req.userId = userId;
    } else {
        // Generate a new user ID
        const newUserId = generateUserId();
        req.userId = newUserId;

        // Set the user ID in the response headers so the client can save it
        res.setHeader('X-User-Id', newUserId);
    }

    next();
} 