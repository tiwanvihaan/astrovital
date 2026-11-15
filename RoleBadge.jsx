import React from 'react';
import { cn } from '@/lib/utils';
import { roleLabel } from '@/lib/teamApi';

const TONES = {
  leader: 'border-brand-cyan/30 bg-brand-cyan/[0.08] text-brand-cyan',
  medical_officer: 'border-brand-violet/30 bg-brand-violet/[0.08] text-brand-violet',
  astronaut: 'border-hairline bg-white/[0.03] text-muted-foreground',
};

export default function RoleBadge({ role, className }) {
  const tone = TONES[role] || TONES.astronaut;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]',
        tone,
        className,
      )}
    >
      {roleLabel(role)}
    </span>
  );
}