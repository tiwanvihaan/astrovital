import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PAD = 8;
const TOOLTIP_WIDTH = 320;

function visibleNode(target) {
  if (!target || typeof document === 'undefined') return null;
  const nodes = Array.from(document.querySelectorAll(`[data-tour="${target}"]`));
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    if (rect.width > 4 && rect.height > 4) return node;
  }
  return null;
}

function visibleRect(target) {
  const node = visibleNode(target);
  return node ? node.getBoundingClientRect() : null;
}

export default function TourOverlay({ steps, step: stepOverride, onDone }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const safeIndex = Math.max(0, Math.min(steps.length - 1, stepOverride ?? index));
  const step = steps[safeIndex];
  const isLast = safeIndex === steps.length - 1;

  useEffect(() => {
    let cancelled = false;
    let timer = null;
    let attempts = 0;

    setRect(null);

    const locate = () => {
      if (cancelled) return;
      const node = visibleNode(step.target);
      if (node) {
        node.scrollIntoView({ block: 'center', behavior: 'smooth' });
        setRect(node.getBoundingClientRect());
        setWaiting(false);
        return;
      }
      attempts += 1;
      if (attempts < 14) timer = setTimeout(locate, 110);
      else setWaiting(false);
    };

    setWaiting(Boolean(step.target));
    if (step.route && step.route !== location.pathname) navigate(step.route);
    if (step.target) timer = setTimeout(locate, 60);

    const onKey = (event) => {
      if (event.key === 'Escape') onDone();
    };
    const onResize = () => setRect(visibleRect(step.target));
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex]);

  const tooltipStyle = useMemo(() => {
    if (typeof window === 'undefined') return {};
    if (!rect) {
      return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: `min(${TOOLTIP_WIDTH}px, calc(100vw - 32px))` };
    }
    const width = Math.min(TOOLTIP_WIDTH, window.innerWidth - 24);
    const left = Math.max(12, Math.min(window.innerWidth - width - 12, rect.left + rect.width / 2 - width / 2));
    const below = rect.bottom + 190 < window.innerHeight;
    const top = below ? rect.bottom + 16 : Math.max(12, rect.top - 190);
    return { left, top, width };
  }, [rect]);

  const spotlight = rect
    ? {
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      }
    : null;

  return (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label="AstroVital walkthrough">
      <div className="absolute inset-0" onClick={(event) => event.stopPropagation()} />

      {spotlight ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-2xl border-2 border-primary/80 transition-all duration-300"
          style={{ ...spotlight, boxShadow: '0 0 0 9999px rgba(3, 8, 20, 0.86)' }}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-[rgba(3,8,20,0.86)]" />
      )}

      <div
        className="absolute z-[121] overflow-hidden rounded-3xl border border-hairline bg-popover/95 p-5 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-primary/80">
            {safeIndex + 1} / {steps.length}
          </p>
          <button
            type="button"
            onClick={onDone}
            aria-label="Close walkthrough"
            className="-mr-1 -mt-1 grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <h2 className="mt-2 text-[17px] leading-tight tracking-tight text-foreground">{step.title}</h2>
        <div className="mt-2 space-y-1.5">
          {step.body.map((line) => (
            <p key={line} className="text-[12px] leading-relaxed text-muted-foreground">
              {line}
            </p>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onDone}
            className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {steps.map((item, i) => (
                <span
                  key={item.id}
                  className={cn('h-1 rounded-full transition-all', i === safeIndex ? 'w-4 bg-primary' : 'w-1 bg-muted-foreground/40')}
                />
              ))}
            </div>
            <Button
              onClick={() => (isLast ? onDone() : setIndex(safeIndex + 1))}
              className="h-9 rounded-xl px-3.5 text-[12px] font-semibold"
              disabled={waiting}
            >
              {step.cta || 'Next'}
              {!isLast && <ArrowRight className="ml-1.5 h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}