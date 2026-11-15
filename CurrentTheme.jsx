import React from 'react';
import useTheme from '@/components/theme/ThemeProvider';

export default function CurrentTheme() {
  const { theme } = useTheme();
  const [, , accent, primary] = theme.palette;

  return (
    <div className="flex items-center gap-2 rounded-full border border-hairline bg-surface/60 py-1 pl-1.5 pr-3">
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full" style={{ background: primary }} />
        <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        Active · <span className="text-foreground">{theme.name}</span>
      </span>
    </div>
  );
}