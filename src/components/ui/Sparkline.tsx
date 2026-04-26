"use client";

interface SparklineProps {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
  fillBelow?: boolean;
}

export function Sparkline({
  values,
  color = "var(--accent)",
  width = 120,
  height = 32,
  fillBelow = true,
}: SparklineProps) {
  if (values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map<[number, number]>((v, i) => [
    (i / Math.max(values.length - 1, 1)) * width,
    height - ((v - min) / range) * height * 0.85 - 2,
  ]);
  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const area = path + ` L${width} ${height} L0 ${height} Z`;

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      {fillBelow && <path d={area} fill={color} opacity={0.1} />}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
