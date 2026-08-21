import { useState, useCallback } from 'react';
import { API_BASE_URL } from '../config';

// Define the exact structure we are sending from the Node.js backend
export interface LogMessage {
  type: 'log' | 'error' | 'system';
  message: string;
}

export const useAgentStream = () => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runAgent = useCallback(async (prompt: string) => {
    // 1. Reset state for a new execution
    setLogs([]);
    setIsStreaming(true);
    setError(null);

    try {
      // 2. Initiate the POST request to the API Gateway
      const response = await fetch(`${API_BASE_URL}/api/agent/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No readable stream available from the server.');
      }

      // 3. Attach a reader to the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      // 4. The Real-Time Reading Loop
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the raw bytes into text and add to our buffer
        buffer += decoder.decode(value, { stream: true });

        // SSE chunks are separated by double newlines
        const lines = buffer.split('\n\n');

        // Keep the last incomplete chunk in the buffer to process next time
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              // Strip "data: " and parse the raw JSON
              const rawJson = line.substring(6);
              const data = JSON.parse(rawJson) as LogMessage;

              // Update the React state to trigger a re-render
              setLogs((prevLogs) => [...prevLogs, data]);
            } catch {
              console.error('[FRONTEND ERROR]: Failed to parse SSE chunk', line);
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while connecting to the agent engine.';
      setError(message);
    } finally {
      setIsStreaming(false); // Cleanly close the streaming state
    }
  }, []);

  return { logs, isStreaming, error, runAgent };
};
