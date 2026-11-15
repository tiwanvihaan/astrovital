import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ThemeCard({ theme, active, onSelect }) {
  const [background, surface, accent, primary, foreground] = theme.palette;

  return (
    <button
      type="button"
      onClick={() => onSelect(theme.id)}
      aria-pressed={active}
      title={`${theme.name} theme`}
      className={cn(
        'group relative rounded-2xl border p-2 text-left transition-all duration-200',
        active
          ? 'border-primary/60 bg-primary/[0.08] shadow-glow'
          : 'border-hairline/70 bg-surface/40 hover:-translate-y-0.5 hover:border-primary/35',
      )}
    >
      <div
        className="relative h-[54px] w-full overflow-hidden rounded-xl"
        style={{ background, boxShadow: `inset 0 0 0 1px ${foreground}24` }}
      >
        <span
          className="absolute left-1.5 top-1.5 block h-[24px] w-[38%] rounded-md"
          style={{ background: surface, boxShadow: `inset 0 0 0 1px ${foreground}1f` }}
        />
        <span
          className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
          style={{ background: primary }}
        />
        <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
          {[primary, accent, foreground].map((swatch, index) => (
            <span
              key={`${swatch}-${index}`}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: swatch, opacity: index === 2 ? 0.55 : 1 }}
            />
          ))}
        </span>
        <span
          className="absolute bottom-1.5 right-1.5 h-3 w-[26%] rounded-[3px]"
          style={{ background: accent, opacity: 0.7 }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-1">
        <span className="truncate text-[11.5px] font-medium tracking-tight text-foreground">{theme.name}</span>
        <span
          className={cn(
            'grid h-4 w-4 shrink-0 place-items-center rounded-full transition-opacity duration-200',
            active ? 'bg-primary text-primary-foreground opacity-100' : 'opacity-0',
          )}
          aria-hidden="true"
        >
          <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
        </span>
      </div>
      <p className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{theme.tagline}</p>
    </button>
  );
}