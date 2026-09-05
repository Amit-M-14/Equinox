import { useState } from 'react';
import { useAgentStream } from '../hooks/useAgentStream';
import AppHeader from './AppHeader';
import ExecutionLogPanel from './ExecutionLogPanel';
import GeneratedFilesPanel from './GeneratedFilesPanel';
import PromptBar from './PromptBar';

export default function TerminalUI() {
  const [prompt, setPrompt] = useState('');
  const { logs, files, isStreaming, status, error, runAgent } = useAgentStream();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isStreaming) return;
    runAgent(prompt);
    setPrompt('');
  };

  const workspaceLog = logs.find((log) => log.type === 'system' && log.message.includes('Workspace directory:'));
  const workspaceRoot = workspaceLog
    ? workspaceLog.message.replace(/^\[SYSTEM\]:\s*Workspace directory:\s*/, '')
    : null;

  return (
    <div className="flex h-screen flex-col bg-neutral-950 text-neutral-100">
      <AppHeader status={status} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 gap-4 overflow-hidden p-4">
        <ExecutionLogPanel logs={logs} isStreaming={isStreaming} error={error} />
        <GeneratedFilesPanel files={files} workspaceRoot={workspaceRoot} />
      </main>

      <PromptBar
        prompt={prompt}
        onPromptChange={setPrompt}
        onSubmit={handleSubmit}
        isStreaming={isStreaming}
      />
    </div>
  );
}
