'use client';

import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { KPIData } from "@/lib/types/inventory";

interface KPICardProps {
  data: KPIData;
}

export function KPICard({ data }: KPICardProps) {
  const chartData = data.sparkline.map((value, index) => ({ value, index }));
  
  return (
    <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-[#64748B] tracking-wide uppercase mb-1">
            {data.label}
          </p>
          <h3 className="text-3xl font-semibold text-[#0F172A] tracking-tight">
            {data.value}
          </h3>
        </div>
        
        {/* Change Badge */}
        {data.change !== 0 && (
          <div className={`
            flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
            ${data.trend === 'up' 
              ? 'bg-emerald-50 text-emerald-700' 
              : 'bg-blue-50 text-blue-700'
            }
          `}>
            {data.trend === 'up' ? (
              <TrendingUp className="w-3 h-3" strokeWidth={2} />
            ) : (
              <TrendingDown className="w-3 h-3" strokeWidth={2} />
            )}
            <span>{Math.abs(data.change)}%</span>
          </div>
        )}
      </div>

      {/* Sparkline */}
      <div className="h-16 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={2}
              dot={false}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Time label */}
      <p className="text-xs text-[#64748B] mt-2">Last 7 days</p>
    </div>
  );
}
