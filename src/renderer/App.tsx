import React from 'react';

export default function App(): JSX.Element {
  return (
    <div className="flex h-screen w-screen flex-col bg-background text-zinc-100">
      <header className="flex h-12 items-center justify-between border-b border-border-subtle px-4">
        <h1 className="text-sm font-semibold tracking-wider text-zinc-200">CS2 ASSISTANT</h1>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-background-container px-2.5 py-0.5 text-xs text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          STANDBY
        </span>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <p className="text-xs text-zinc-500">Repository Foundation Initialized</p>
      </main>
    </div>
  );
}
