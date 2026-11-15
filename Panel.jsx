import React from 'react';
import { cn } from '@/lib/utils';

export default function Panel({ eyebrow, title, subtitle, action, children, className, contentClassName }) {
  const hasHeader = Boolean(eyebrow || title || action);
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-3xl border border-hairline bg-surface/70 shadow-panel backdrop-blur-xl',
        className,
      )}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 className="mt-1.5 font-body text-[14px] font-medium leading-snug tracking-tight text-foreground">{title}</h2>}
            {subtitle && <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn('p-5 sm:p-6', hasHeader && 'pt-4', contentClassName)}>{children}</div>
    </section>
  );
}