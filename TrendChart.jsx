import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartColors, gradientKey } from '@/components/theme/themeUtils';

function ChartTip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-hairline bg-card/95 px-3 py-2 shadow-xl backdrop-blur">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="num mt-1 text-[13px]" style={{ color: entry.color }}>
          {typeof entry.value === 'number' ? entry.value.toFixed(entry.value % 1 === 0 ? 0 : 2) : entry.value}
          {unit ? <span className="ml-1 text-[10px] text-muted-foreground">{unit}</span> : null}
        </p>
      ))}
    </div>
  );
}

function bounds(data, keys, pad = 0.12) {
  const values = data.flatMap((row) => keys.map((k) => row[k]).filter((v) => typeof v === 'number'));
  if (!values.length) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || Math.abs(max) * 0.1 || 1;
  return [min - spread * pad, max + spread * pad];
}

export default function TrendChart({
  data = [],
  keys,
  height = 220,
  unit = '',
  type = 'area',
  yDomain,
  showGrid = true,
}) {
  const colors = useChartColors();
  const series = keys && keys.length ? keys : [{ key: 'value', color: 'primary' }];
  const resolve = (color) => (color && colors[color]) || color || colors.primary;

  const domain = yDomain || bounds(data, series.map((k) => k.key));
  const gradientId = `trend-${gradientKey(resolve(series[0].color))}`;
  const lead = resolve(series[0].color);

  if (!data.length) {
    return (
      <div style={{ height }} className="flex items-center justify-center rounded-2xl border border-dashed border-hairline text-[12px] text-muted-foreground">
        No readings recorded yet
      </div>
    );
  }

  const axisProps = {
    tick: { fill: colors.muted, fontSize: 10.5, fontFamily: "'Source Code Pro', monospace" },
    axisLine: false,
    tickLine: false,
  };

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'area' ? (
          <AreaChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lead} stopOpacity={0.28} />
                <stop offset="100%" stopColor={lead} stopOpacity={0} />
              </linearGradient>
            </defs>
            {showGrid && <CartesianGrid stroke={colors.grid} strokeOpacity={0.35} vertical={false} />}
            <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={24} />
            <YAxis domain={domain} {...axisProps} width={46} />
            <Tooltip content={<ChartTip unit={unit} />} cursor={{ stroke: colors.grid }} />
            <Area
              type="monotone"
              dataKey={series[0].key}
              stroke={lead}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: lead, stroke: colors.background, strokeWidth: 2 }}
            />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: -12 }}>
            {showGrid && <CartesianGrid stroke={colors.grid} strokeOpacity={0.35} vertical={false} />}
            <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={24} />
            <YAxis domain={domain} {...axisProps} width={46} />
            <Tooltip content={<ChartTip unit={unit} />} cursor={{ stroke: colors.grid }} />
            {series.map((k) => (
              <Line
                key={k.key}
                type="monotone"
                dataKey={k.key}
                name={k.label}
                stroke={resolve(k.color)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: resolve(k.color), stroke: colors.background, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}