import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLORS } from '@/lib/health';

export default function SubScoreBars({ scores = [] }) {
  return (
    <div className="space-y-4">
      {scores.map((score) => {
        const color = COLORS[score.color] || COLORS.cyan;
        const delta = score.delta;
        return (
          <div key={score.label}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[12.5px] tracking-tight text-muted-foreground">{score.label}</p>
              <div className="flex items-center gap-2">
                {delta !== null && delta !== undefined && (
                  <span
                    className={cn(
                      'num inline-flex items-center gap-0.5 font-mono text-[10px]',
                      delta >= 0 ? 'text-brand-mint' : 'text-brand-amber',
                    )}
                  >
                    {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(delta).toFixed(0)}
                  </span>
                )}
                <span className="num text-[13px] font-medium text-foreground">
                  {score.value === null || score.value === undefined ? '—' : Math.round(score.value)}
                  {score.suffix || ''}
                </span>
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-[width] duration-1000 ease-out"
                style={{
                  width: `${Math.max(2, Math.min(100, score.value || 0))}%`,
                  background: `linear-gradient(90deg, ${color}66, ${color})`,
                  boxShadow: `0 0 10px ${color}55`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}