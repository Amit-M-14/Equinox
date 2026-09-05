import { useState } from 'react';
import { Check, Copy, File, FolderOpen } from 'lucide-react';
import type { GeneratedFile } from '../hooks/useAgentStream';

interface GeneratedFilesPanelProps {
  files: GeneratedFile[];
  workspaceRoot: string | null;
}

function fileName(relativePath: string): string {
  const parts = relativePath.split(/[\\/]/);
  return parts[parts.length - 1] || relativePath;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access denied — nothing actionable to do here.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy full path"
      className="flex-shrink-0 rounded p-1 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function GeneratedFilesPanel({ files, workspaceRoot }: GeneratedFilesPanelProps) {
  return (
    <aside className="flex w-72 flex-shrink-0 flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
      <div className="border-b border-neutral-800 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-neutral-500" />
          <h2 className="text-xs font-semibold tracking-wide text-neutral-300">GENERATED FILES</h2>
          {files.length > 0 && (
            <span className="ml-auto rounded-full bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400">
              {files.length}
            </span>
          )}
        </div>
        <p className="mt-1 truncate font-mono text-[10px] text-neutral-600" title={workspaceRoot ?? undefined}>
          {workspaceRoot ?? 'Saved under workspace/ at the project root'}
        </p>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-2 custom-scrollbar">
        {files.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-neutral-600">
            <File className="h-6 w-6" />
            <p className="text-xs">Files the agent writes will show up here with their exact save location.</p>
          </div>
        )}

        {files.map((file, index) => (
          <div
            key={`${file.path}-${index}`}
            className="group flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-neutral-800/60"
          >
            <File className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400/80" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-neutral-200">{fileName(file.path)}</div>
              <div className="truncate font-mono text-[10px] text-neutral-500" title={file.absolutePath}>
                {file.path}
              </div>
            </div>
            <CopyButton value={file.absolutePath} />
          </div>
        ))}
      </div>
    </aside>
  );
}
