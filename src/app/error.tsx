"use client";

import { useEffect } from "react";
import { WifiOff } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-3 py-2.5">
        <div className="p-3 rounded-lg bg-warning-soft border border-warning/30 flex items-center gap-2.5 text-[13px]">
          <span className="w-2 h-2 rounded-full bg-warning animate-pulse flex-shrink-0" />
          <span className="font-semibold">You&apos;re offline.</span>
          <span className="text-text-secondary">Drafts and vitals will sync when connection returns.</span>
          <div className="flex-1" />
          <button onClick={reset} className="px-3 py-1 rounded-lg bg-surface-1 border border-border-subtle text-[12px] font-semibold text-text-secondary hover:bg-surface-2">Retry</button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-[420px]">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-danger-soft flex items-center justify-center text-danger mb-5">
            <WifiOff size={42} />
          </div>
          <h2 className="text-[22px] font-semibold mb-2">Cannot reach Ashwini</h2>
          <p className="text-[13px] text-text-secondary leading-relaxed mb-4">
            We&apos;re showing the last cached snapshot. New data may be missing. Local drafts are safe.
          </p>
          <div className="p-3 rounded-lg bg-surface-2 font-mono text-[11px] text-text-muted text-left mb-4">
            <div>STATUS &nbsp;503 service unavailable</div>
            <div>EDGE &nbsp;&nbsp;&nbsp;blr-1 · BLR · 142ms</div>
            <div>ERROR &nbsp;&nbsp;{error.message || "Network error"}</div>
          </div>
          <div className="flex gap-2 justify-center">
            <button onClick={() => window.location.href = "/status"} className="px-4 py-2.5 rounded-lg bg-surface-1 border border-border-subtle text-[13px] font-semibold text-text-secondary hover:bg-surface-2">Status page</button>
            <button onClick={reset} className="px-4 py-2.5 rounded-lg bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover">Retry connection</button>
          </div>
        </div>
      </div>
    </div>
  );
}
