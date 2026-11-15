import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TrendBadge({ value, invert = false, className }) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return (
      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10.5px] text-muted-foreground', className)}>
        <Minus className="h-3 w-3" /> no prior
      </span>
    );
  }

  const rounded = Math.abs(value) < 0.05 ? 0 : value;
  const up = rounded > 0;
  const flat = rounded === 0;
  const good = invert ? !up : up;

  const tone = flat
    ? 'text-muted-foreground bg-white/[0.04]'
    : good
      ? 'text-brand-mint bg-brand-mint/10'
      : 'text-brand-amber bg-brand-amber/10';

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-[10.5px] num', tone, className)}>
      {flat ? <Minus className="h-3 w-3" /> : up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {flat ? '0.0%' : `${Math.abs(rounded).toFixed(1)}%`}
    </span>
  );
}