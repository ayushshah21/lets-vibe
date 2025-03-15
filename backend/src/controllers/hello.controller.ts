import { Request, Response } from 'express';
import { createHelloResponse } from '../models/hello.model';

/**
 * GET /api/hello
 * Returns a hello world message
 */
export const helloWorld = (req: Request, res: Response): void => {
    const helloResponse = createHelloResponse();
    res.status(200).json(helloResponse);
}; 