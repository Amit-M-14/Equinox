import { Play, Terminal, Loader2 } from 'lucide-react';

interface TerminalInputBarProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isStreaming: boolean;
}

export default function TerminalInputBar({
  prompt,
  onPromptChange,
  onSubmit,
  isStreaming,
}: TerminalInputBarProps) {
  return (
    <div className="p-4 bg-slate-950 border-t border-slate-800">
      <form onSubmit={onSubmit} className="flex relative items-center">
        <Terminal className="absolute left-3 text-slate-500 w-5 h-5" />
        <input
          type="text"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={isStreaming}
          placeholder="E.g., Create a Python script that calculates prime numbers..."
          className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg pl-10 pr-14 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isStreaming}
          className="absolute right-2 p-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-400 transition-colors"
        >
          {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
