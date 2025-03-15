/**
 * Key used to store the user ID in localStorage
 */
const USER_ID_KEY = 'lets_vibe_user_id';

/**
 * Get the user ID from localStorage
 */
export function getUserId(): string | null {
    return localStorage.getItem(USER_ID_KEY);
}

/**
 * Set the user ID in localStorage
 */
export function setUserId(userId: string): void {
    localStorage.setItem(USER_ID_KEY, userId);
}

/**
 * Clear the user ID from localStorage
 */
export function clearUserId(): void {
    localStorage.removeItem(USER_ID_KEY);
} 