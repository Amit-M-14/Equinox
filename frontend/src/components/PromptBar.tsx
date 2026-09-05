import { ArrowUp, Loader2 } from 'lucide-react';

interface PromptBarProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isStreaming: boolean;
}

export default function PromptBar({ prompt, onPromptChange, onSubmit, isStreaming }: PromptBarProps) {
  return (
    <div className="border-t border-neutral-800 bg-neutral-900/60 px-4 py-4">
      <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-6xl items-end gap-2">
        <textarea
          rows={1}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
          disabled={isStreaming}
          placeholder="Describe what to build, e.g. a Python script that calculates prime numbers…"
          className="min-h-[44px] flex-1 resize-none rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isStreaming}
          className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white transition-colors hover:bg-indigo-400 disabled:bg-neutral-800 disabled:text-neutral-600"
        >
          {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
