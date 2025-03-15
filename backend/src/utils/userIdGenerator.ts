import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique user ID for anonymous users
 * This can be stored in localStorage to identify users across sessions
 */
export function generateUserId(): string {
    return uuidv4();
}

/**
 * Validates if a user ID is in the correct format
 */
export function isValidUserId(userId: string): boolean {
    // Simple UUID validation regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(userId);
} 