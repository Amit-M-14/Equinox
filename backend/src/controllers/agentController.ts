import { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import ExecutionLog from '../models/ExecutionLog.js';

// Resolve paths relative to this file's location (not process.cwd()), so the
// server behaves the same whether it's started via `npm run dev` in backend/,
// a compiled dist/ build, or anywhere else. This file lives at
// backend/src/controllers/agentController.ts (or dist/controllers/... once
// built), so the repo root is three levels up in both cases.
const REPO_ROOT = path.resolve(__dirname, '../../..');
const ENGINE_SCRIPT_PATH = path.join(REPO_ROOT, 'Engine', 'agent.py');

// Every file the agent writes lands here, never scattered across the repo.
const WORKSPACE_DIR = path.join(REPO_ROOT, 'workspace');

// Matches tools.py's `write_file` success message: "Successfully wrote to <path>"
const WRITE_FILE_PATTERN = /Successfully wrote to (.+)/;

export const triggerAgent = async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;

        // 1. Guard Clause: Always validate user input first
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'A valid text prompt is required.' });
        }

        fs.mkdirSync(WORKSPACE_DIR, { recursive: true });

        // 2. Establish Server-Sent Events (SSE) Headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 3. Database Initialization: Create the log document. This is
        // best-effort — the agent must still run even if Mongo is unreachable,
        // matching the "continue without DB" fallback server.ts already logs.
        let logDocId: string | null = null;
        try {
            const logDoc = await ExecutionLog.create({
                prompt: prompt,
                logs: ['[SYSTEM]: Engine initializing...'],
                files: [],
                status: 'RUNNING'
            });
            logDocId = String(logDoc._id);
        } catch (dbError) {
            console.error('[DB WARNING]: Could not create execution log, continuing without persistence:', dbError);
        }

        // We will store all incoming logs in this array to save to the DB later
        const collectedLogs: string[] = [];
        const writtenFiles: string[] = [];

        // Helper function to send data to the frontend AND save to our array
        const streamAndStore = (message: string, type: 'log' | 'error' | 'system') => {
            const cleanMessage = message.trim();
            if (!cleanMessage) return;

            collectedLogs.push(cleanMessage);

            // Surface file writes as their own event type so the UI can show
            // exactly where each generated file landed, instead of the user
            // having to spot it inside a wall of log text.
            const writeMatch = cleanMessage.match(WRITE_FILE_PATTERN);
            if (writeMatch) {
                const relativePath = writeMatch[1].trim();
                const absolutePath = path.resolve(WORKSPACE_DIR, relativePath);
                writtenFiles.push(relativePath);
                res.write(`data: ${JSON.stringify({
                    type: 'file',
                    message: cleanMessage,
                    path: relativePath,
                    absolutePath,
                })}\n\n`);
                return;
            }

            res.write(`data: ${JSON.stringify({ type, message: cleanMessage })}\n\n`);
        };

        streamAndStore('[SYSTEM]: Engine initializing...', 'system');
        streamAndStore(`[SYSTEM]: Workspace directory: ${WORKSPACE_DIR}`, 'system');

        // 4. Spawn the Python Engine, rooted at the workspace directory so every
        // relative read_file/write_file/list_files call resolves there.
        const pythonExecutable = process.env.PYTHON_PATH || 'python';
        const pythonProcess = spawn(pythonExecutable, [ENGINE_SCRIPT_PATH, prompt], {
            cwd: WORKSPACE_DIR,
        });

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

        pythonProcess.on('error', (err) => {
            streamAndStore(`[SYSTEM]: Failed to start engine process: ${err.message}`, 'error');
        });

        // 7. Cleanup & Database Finalization on Exit
        pythonProcess.on('close', async (code: number) => {
            const finalStatus = code === 0 ? 'COMPLETED' : 'FAILED';
            streamAndStore(`[SYSTEM]: Process exited with code ${code}`, 'system');

            // Save the final execution trace to MongoDB, if we managed to create it
            if (logDocId) {
                try {
                    await ExecutionLog.findByIdAndUpdate(logDocId, {
                        logs: collectedLogs,
                        files: writtenFiles,
                        status: finalStatus
                    });
                } catch (dbError) {
                    console.error('[DB WARNING]: Could not save execution log:', dbError);
                }
            }

            res.end(); // Close the streaming connection
        });

    } catch (error) {
        console.error('[SERVER ERROR]:', error);
        res.status(500).json({ error: 'Internal server error while triggering agent.' });
    }
};