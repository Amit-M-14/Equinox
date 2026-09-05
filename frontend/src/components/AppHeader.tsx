import type { RunStatus } from '../hooks/useAgentStream';

const STATUS_CONFIG: Record<RunStatus, { label: string; dot: string; text: string }> = {
  idle: { label: 'Idle', dot: 'bg-neutral-500', text: 'text-neutral-400' },
  running: { label: 'Running', dot: 'bg-amber-400 animate-pulse', text: 'text-amber-300' },
  completed: { label: 'Completed', dot: 'bg-emerald-400', text: 'text-emerald-300' },
  failed: { label: 'Failed', dot: 'bg-red-400', text: 'text-red-300' },
};

export default function AppHeader({ status }: { status: RunStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/60 px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-500/15 text-sm font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/30">
          Eq
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-tight text-neutral-100">Equinox</h1>
          <p className="text-xs leading-tight text-neutral-500">Autonomous coding agent</p>
        </div>
      </div>

      <div className={`flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs font-medium ${config.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </div>
    </header>
  );
}
