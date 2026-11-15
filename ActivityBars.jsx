import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-hairline bg-[#0A1220]/95 px-3 py-2 shadow-xl backdrop-blur">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="num mt-1 text-[12px]" style={{ color: entry.color }}>
          {entry.value} min <span className="text-[10px] text-muted-foreground">{entry.name}</span>
        </p>
      ))}
    </div>
  );
}

export default function ActivityBars({ data = [], height = 230 }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: -18 }} barGap={2}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'hsl(215 22% 58%)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            tick={{ fill: 'hsl(215 22% 58%)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="movement" name="Movement" fill="#55DFFF" radius={[3, 3, 0, 0]} maxBarSize={12} />
          <Bar dataKey="mobility" name="Mobility" fill="#9B8CFF" radius={[3, 3, 0, 0]} maxBarSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}