import { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import type { LogMessage } from '../hooks/useAgentStream';

interface TerminalOutputProps {
  logs: LogMessage[];
  isStreaming: boolean;
  error: string | null;
}

export default function TerminalOutput({ logs, isStreaming, error }: TerminalOutputProps) {
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-2 custom-scrollbar">
      {logs.length === 0 && !isStreaming && (
        <div className="text-slate-500 text-center mt-10">
          System ready. Awaiting operational prompt...
        </div>
      )}

      {logs.map((log, index) => (
        <div
          key={index}
          className={`leading-relaxed break-words ${
            log.type === 'error'
              ? 'text-red-400'
              : log.type === 'system'
                ? 'text-cyan-400'
                : 'text-green-400'
          }`}
        >
          {log.type === 'error' && <AlertCircle className="inline w-4 h-4 mr-2 mb-1" />}
          {log.message}
        </div>
      ))}

      {error && (
        <div className="text-red-500 mt-4 flex items-center bg-red-950/30 p-3 rounded border border-red-900/50">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      <div ref={endOfLogsRef} />
    </div>
  );
}
