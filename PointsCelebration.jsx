import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, X } from 'lucide-react';

/** Celebration for points that were just earned — fires once per batch. */
export default function PointsCelebration({ awards = [], onDone }) {
  const open = awards.length > 0;
  const total = awards.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  useEffect(() => {
    if (!open) return undefined;
    confetti({
      particleCount: 70,
      spread: 68,
      startVelocity: 34,
      origin: { y: 0.35 },
      colors: ['#5ee7f7', '#9d8bff', '#5ef0b3', '#ffc46b', '#ff8fb1'],
      disableForReducedMotion: true,
    });
    const timer = setTimeout(() => {
      if (onDone) onDone();
    }, 4200);
    return () => clearTimeout(timer);
  }, [open, onDone]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="pointer-events-auto fixed left-1/2 top-4 z-50 w-[min(92vw,26rem)] -translate-x-1/2 rounded-2xl border border-primary/40 bg-surface/95 p-4 shadow-glow backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15">
              <Sparkles className="h-4 w-4 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="num text-[22px] leading-none text-foreground">+{total} AstroPoints</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                {awards.length} new award{awards.length === 1 ? '' : 's'}
              </p>
              <ul className="mt-2 space-y-0.5">
                {awards.slice(0, 3).map((row) => (
                  <li key={row.id || row.label} className="truncate text-[11px] text-muted-foreground">
                    {row.label} <span className="text-foreground">+{row.amount}</span>
                  </li>
                ))}
                {awards.length > 3 && (
                  <li className="text-[11px] text-muted-foreground/70">and {awards.length - 3} more</li>
                )}
              </ul>
            </div>
            <button
              type="button"
              onClick={onDone}
              aria-label="Dismiss"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}