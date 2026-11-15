import React from 'react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { useChartColors, gradientKey } from '@/components/theme/themeUtils';

export default function Sparkline({ data = [], color, height = 46 }) {
  const colors = useChartColors();
  const resolved = (color && colors[color]) || color || colors.primary;
  const gradientId = `spark-${gradientKey(resolved)}-${height}`;

  if (!data || data.length < 2) {
    return <div style={{ height }} className="flex items-center text-[10.5px] text-muted-foreground/70">Not enough readings yet</div>;
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={resolved} stopOpacity={0.35} />
              <stop offset="100%" stopColor={resolved} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={resolved}
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}