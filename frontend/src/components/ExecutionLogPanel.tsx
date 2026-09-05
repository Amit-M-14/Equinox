import { useEffect, useRef } from 'react';
import { AlertCircle, FileOutput, ScrollText, Terminal, Wrench, Eye, MessageSquare, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { LogMessage } from '../hooks/useAgentStream';

interface ExecutionLogPanelProps {
  logs: LogMessage[];
  isStreaming: boolean;
  error: string | null;
}

type Kind = 'step' | 'action' | 'observation' | 'system' | 'final' | 'error' | 'file' | 'plain';

const STEP_PATTERN = /^--- STEP (\d+) ---$/;
const KIND_CONFIG: Record<Exclude<Kind, 'step' | 'plain'>, { label: string; icon: typeof Wrench; className: string }> = {
  action: { label: 'ACTION', icon: Wrench, className: 'text-amber-300 border-amber-500/20 bg-amber-500/5' },
  observation: { label: 'OBSERVATION', icon: Eye, className: 'text-sky-300 border-sky-500/20 bg-sky-500/5' },
  system: { label: 'SYSTEM', icon: Info, className: 'text-neutral-400 border-neutral-700 bg-neutral-800/40' },
  final: { label: 'RESPONSE', icon: MessageSquare, className: 'text-emerald-300 border-emerald-500/20 bg-emerald-500/5' },
  error: { label: 'ERROR', icon: AlertCircle, className: 'text-red-300 border-red-500/20 bg-red-500/5' },
  file: { label: 'FILE WRITTEN', icon: FileOutput, className: 'text-emerald-300 border-emerald-500/20 bg-emerald-500/5' },
};

function classify(log: LogMessage): { kind: Kind; body: string } {
  if (log.type === 'file') return { kind: 'file', body: log.message };
  if (log.type === 'error') return { kind: 'error', body: stripPrefix(log.message) };

  if (STEP_PATTERN.test(log.message)) return { kind: 'step', body: log.message };
  if (log.message.startsWith('[ACTION]:')) return { kind: 'action', body: stripPrefix(log.message) };
  if (log.message.startsWith('[OBSERVATION]:')) return { kind: 'observation', body: stripPrefix(log.message) };
  if (log.message.startsWith('[SYSTEM]:')) return { kind: 'system', body: stripPrefix(log.message) };
  if (log.message.startsWith('[FINAL RESPONSE]:')) return { kind: 'final', body: stripPrefix(log.message) };
  if (log.message.startsWith('[ERROR]:')) return { kind: 'error', body: stripPrefix(log.message) };

  return { kind: 'plain', body: log.message };
}

function stripPrefix(message: string): string {
  return message.replace(/^\[[A-Z ]+\]:\s*/, '');
}

function LogRow({ log }: { log: LogMessage }) {
  const { kind, body } = classify(log);

  if (kind === 'step') {
    const match = body.match(STEP_PATTERN);
    return (
      <div className="my-2 flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-neutral-600">
        <div className="h-px flex-1 bg-neutral-800" />
        Step {match?.[1]}
        <div className="h-px flex-1 bg-neutral-800" />
      </div>
    );
  }

  if (kind === 'plain') {
    return <div className="pl-1 leading-relaxed text-neutral-400">{body}</div>;
  }

  const { label, icon: Icon, className } = KIND_CONFIG[kind];

  return (
    <div className={`flex items-start gap-2 rounded-md border px-3 py-2 ${className}`}>
      <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-[10px] font-semibold tracking-wider opacity-70">{label}</div>
        {kind === 'file' ? (
          <div className="font-mono text-xs text-neutral-200">{stripPrefix(body)}</div>
        ) : (
          <div className="text-sm leading-relaxed text-neutral-200 [&_p]:m-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0">
            <ReactMarkdown
              components={{
                // Fenced code blocks always come through as <pre><code>; a bare
                // `code` override (with no `inline` prop — react-markdown v10
                // dropped it) can't tell block from inline apart, and rendering
                // a <div> there produces invalid <div>-inside-<p> nesting for
                // inline spans. Styling `pre` for blocks and keeping `code`
                // inline-safe avoids that.
                pre({ children }) {
                  return (
                    <pre className="my-2 overflow-x-auto rounded-md border border-neutral-800 bg-neutral-950 p-3 text-emerald-300">
                      {children}
                    </pre>
                  );
                },
                code({ className, children, ...props }) {
                  return (
                    <code className={`rounded bg-neutral-800 px-1.5 py-0.5 text-emerald-300 ${className ?? ''}`} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {body}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExecutionLogPanel({ logs, isStreaming, error }: ExecutionLogPanelProps) {
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
      <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2.5">
        <ScrollText className="h-4 w-4 text-neutral-500" />
        <h2 className="text-xs font-semibold tracking-wide text-neutral-300">EXECUTION LOG</h2>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto p-3 font-mono text-sm custom-scrollbar">
        {logs.length === 0 && !error && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-neutral-600">
            <Terminal className="h-8 w-8" />
            <p className="max-w-xs text-sm">
              Describe what you want built. Each reasoning step, tool call, and file write will stream here.
            </p>
          </div>
        )}

        {logs.map((log, index) => (
          <LogRow key={index} log={log} />
        ))}

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2 text-red-300">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <div className="text-sm">{error}</div>
          </div>
        )}

        {isStreaming && (
          <div className="flex items-center gap-2 pl-1 text-xs text-neutral-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
            Working…
          </div>
        )}

        <div ref={endOfLogsRef} />
      </div>
    </section>
  );
}
