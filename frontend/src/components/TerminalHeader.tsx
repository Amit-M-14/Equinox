import { SquareTerminal } from 'lucide-react';

export default function TerminalHeader() {
  return (
    <div className="flex items-center px-4 py-3 bg-slate-900 border-b border-slate-800">
      <div className="flex space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
      </div>
      <div className="mx-auto flex items-center text-slate-400 text-sm font-medium">
        <SquareTerminal className="w-4 h-4 mr-2" />
        Equinox Agent Execution
      </div>
    </div>
  );
}
