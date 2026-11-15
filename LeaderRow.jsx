import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { initialsOf } from '@/lib/astroPoints';
import { cn } from '@/lib/utils';

const PODIUM = {
  1: 'border-brand-amber/45 bg-brand-amber/[0.08]',
  2: 'border-foreground/25 bg-foreground/[0.05]',
  3: 'border-brand-violet/35 bg-brand-violet/[0.07]',
};

export default function LeaderRow({ row, compact = false }) {
  return (
    <motion.li
      layout
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className={cn(
        'flex items-center gap-2.5 rounded-xl border px-2.5 py-2',
        PODIUM[row.rank] || 'border-transparent bg-foreground/[0.02]',
        row.is_me && 'ring-1 ring-primary/40',
      )}
    >
      <span
        className={cn(
          'grid h-6 w-6 shrink-0 place-items-center rounded-lg font-mono text-[10px]',
          row.rank <= 3 ? 'bg-background/60 text-foreground' : 'text-muted-foreground',
        )}
      >
        {row.rank}
      </span>

      {row.avatar_url ? (
        <img
          src={row.avatar_url}
          alt=""
          className="h-7 w-7 shrink-0 rounded-full border border-hairline object-cover"
        />
      ) : (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hairline bg-foreground/[0.04] font-heading text-[8px] text-foreground">
          {initialsOf(row.display_name)}
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] text-foreground">
          {row.display_name}
          {row.is_me && <span className="ml-1.5 font-mono text-[8.5px] uppercase tracking-[0.1em] text-primary">you</span>}
        </span>
        {!compact && row.streak > 0 && (
          <span className="inline-flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-[0.1em] text-brand-amber/80">
            <Flame className="h-2.5 w-2.5" /> {row.streak}d streak
          </span>
        )}
      </span>

      {compact && row.streak > 0 && (
        <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[8.5px] uppercase tracking-[0.1em] text-brand-amber/80">
          <Flame className="h-2.5 w-2.5" /> {row.streak}d
        </span>
      )}

      <span className="num shrink-0 text-[12px] text-foreground">{row.points}</span>
    </motion.li>
  );
}