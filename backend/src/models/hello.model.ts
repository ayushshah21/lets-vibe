/**
 * Hello model interface
 */
export interface HelloResponse {
    message: string;
    timestamp: string;
}

/**
 * Create a new hello response
 */
export const createHelloResponse = (): HelloResponse => {
    return {
        message: 'Hello, World!',
        timestamp: new Date().toISOString()
    };
}; 