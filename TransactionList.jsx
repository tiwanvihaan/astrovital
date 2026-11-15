import React from 'react';
import { motion } from 'framer-motion';
import Panel from '@/components/common/Panel';
import { CATEGORY_META, formatDay } from '@/lib/astroPoints';
import { cn } from '@/lib/utils';

export default function TransactionList({ transactions = [] }) {
  return (
    <Panel
      eyebrow="Transaction history"
      title="Recent point activity"
      subtitle="Every entry is written once and never overwritten."
    >
      {!transactions.length ? (
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">No transactions yet.</p>
      ) : (
        <ul className="divide-y divide-hairline/50">
          {transactions.map((row, index) => {
            const meta = CATEGORY_META[row.category] || CATEGORY_META.movement;
            const Icon = meta.icon;
            return (
              <motion.li
                key={row.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.3) }}
                className="flex items-center gap-2.5 py-2"
              >
                <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-lg border', meta.chip)}>
                  <Icon className={cn('h-3 w-3', meta.tone)} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11.5px] text-foreground">{row.label}</span>
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">
                    {formatDay(row.day)}
                  </span>
                </span>
                <span className="num shrink-0 text-[11.5px] text-brand-mint">+{row.amount}</span>
              </motion.li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}