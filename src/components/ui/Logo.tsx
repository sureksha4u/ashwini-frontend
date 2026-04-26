"use client";

interface LogoProps {
  size?: number;
}

export function Logo({ size = 28 }: LogoProps) {
  return (
    <div
      className="rounded-lg grid place-items-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, var(--logo-from), var(--logo-to))",
        boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
      }}
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M3 12h4l2-7 4 14 2-7h6" />
      </svg>
    </div>
  );
}

export function Wordmark({ size = 16 }: { size?: number }) {
  return (
    <div
      className="flex items-baseline gap-1 font-semibold tracking-tight"
      style={{ fontSize: size }}
    >
      <span className="text-text-primary">Ashwini</span>
      <span className="text-accent">HMS</span>
    </div>
  );
}
