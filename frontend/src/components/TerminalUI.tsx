import { useState } from 'react';
import { useAgentStream } from '../hooks/useAgentStream';
import TerminalHeader from './TerminalHeader';
import TerminalOutput from './TerminalOutput';
import TerminalInputBar from './TerminalInputBar';

export default function TerminalUI() {
  const [prompt, setPrompt] = useState('');
  const { logs, isStreaming, error, runAgent } = useAgentStream();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isStreaming) return;
    runAgent(prompt);
    setPrompt('');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 p-4 md:p-8 font-sans">
      <div className="max-w-5xl w-full mx-auto flex flex-col h-full border border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-slate-900">
        <TerminalHeader />
        <TerminalOutput logs={logs} isStreaming={isStreaming} error={error} />
        <TerminalInputBar
          prompt={prompt}
          onPromptChange={setPrompt}
          onSubmit={handleSubmit}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
