import { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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
    <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-3 custom-scrollbar">
      {/* ... keep your empty state and error rendering ... */}
      
      {logs.map((log, index) => (
        <div key={index} className={`leading-relaxed break-words flex items-start ${
          log.type === 'error' ? 'text-red-400' : log.type === 'system' ? 'text-cyan-400' : 'text-slate-300'
        }`}>
          {log.type === 'error' && <AlertCircle className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />}
          <div className="flex-1">
            <ReactMarkdown 
              components={{
                code({ inline, className, children, ...props }: any) {
                  return !inline ? (
                    <div className="bg-slate-950 border border-slate-800 rounded-md p-3 my-2 overflow-x-auto text-green-400">
                      <code {...props}>{children}</code>
                    </div>
                  ) : (
                    <code className="bg-slate-800 px-1.5 py-0.5 rounded text-green-300" {...props}>{children}</code>
                  );
                }
              }}
            >
              {log.message}
            </ReactMarkdown>
          </div>
        </div>
      ))}
      <div ref={endOfLogsRef} />
    </div>
  );
}