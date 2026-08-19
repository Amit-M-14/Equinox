import { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import ExecutionLog from '../models/ExecutionLog.js';

export const triggerAgent = async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;

        // 1. Guard Clause: Always validate user input first
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'A valid text prompt is required.' });
        }

        // 2. Establish Server-Sent Events (SSE) Headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 3. Database Initialization: Create the log document
        const logDoc = await ExecutionLog.create({
            prompt: prompt,
            logs: ['[SYSTEM]: Engine initializing...'],
            status: 'RUNNING'
        });

        // We will store all incoming logs in this array to save to the DB later
        const collectedLogs: string[] = [];

        // Helper function to send data to the frontend AND save to our array
        const streamAndStore = (message: string, type: 'log' | 'error' | 'system') => {
            const cleanMessage = message.trim();
            if (cleanMessage) {
                collectedLogs.push(cleanMessage);
                res.write(`data: ${JSON.stringify({ type, message: cleanMessage })}\n\n`);
            }
        };

        streamAndStore('[SYSTEM]: Engine initializing...', 'system');

        // 4. Spawn the Python Engine
        const pythonExecutable = process.env.PYTHON_PATH || 'python';
        const scriptPath = path.resolve(process.cwd(), '../engine/agent.py');
        const pythonProcess = spawn(pythonExecutable, [scriptPath, prompt]);

        // 5. Listen to Python's Output (stdout)
        pythonProcess.stdout.on('data', (data: Buffer) => {
            const lines = data.toString().split('\n');
            lines.forEach((line) => streamAndStore(line, 'log'));
        });

        // 6. Listen to Python's Errors (stderr)
        pythonProcess.stderr.on('data', (data: Buffer) => {
            const lines = data.toString().split('\n');
            lines.forEach((line) => streamAndStore(line, 'error'));
        });

        // 7. Cleanup & Database Finalization on Exit
        pythonProcess.on('close', async (code: number) => {
            const finalStatus = code === 0 ? 'COMPLETED' : 'FAILED';
            streamAndStore(`[SYSTEM]: Process exited with code ${code}`, 'system');

            // Save the final execution trace to MongoDB
            await ExecutionLog.findByIdAndUpdate(logDoc._id, {
                logs: collectedLogs,
                status: finalStatus
            });

            res.end(); // Close the streaming connection
        });

    } catch (error) {
        console.error('[SERVER ERROR]:', error);
        res.status(500).json({ error: 'Internal server error while triggering agent.' });
    }
};