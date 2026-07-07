"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  isRefreshing?: boolean;
  ariaLabel?: string;
};


export function DataRefreshButton({ onClick, disabled, isRefreshing, ariaLabel = "Refresh panel data" }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showRefreshing = mounted && isRefreshing;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={onClick}
      disabled={disabled || showRefreshing}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--gf-text-muted)] transition-all duration-300 hover:border-white/30 hover:text-white hover:bg-white/10 disabled:pointer-events-none disabled:opacity-40"
    >
      <RefreshCw
        className={`size-3.5 ${showRefreshing ? "animate-spin text-white" : ""}`}
        aria-hidden
        strokeWidth={2.25}
      />
    </button>
  );
}