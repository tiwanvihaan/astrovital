import React from 'react';
import { Image } from '@/components/ui/image';
import { initialsOf } from '@/lib/displayName';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: 'h-7 w-7 text-[9px]',
  md: 'h-9 w-9 text-[10.5px]',
  lg: 'h-12 w-12 text-[13px]',
};

export default function MemberAvatar({ name, src, size = 'md', className }) {
  return (
    <div
      className={cn(
        'relative grid shrink-0 place-items-center overflow-hidden rounded-xl border border-hairline/80 bg-white/[0.05] font-mono font-medium tracking-[0.06em] text-brand-cyan',
        SIZES[size],
        className,
      )}
      aria-hidden="true"
    >
      {src ? (
        <Image src={src} alt="" fittingType="fill" className="h-full w-full" />
      ) : (
        initialsOf(name)
      )}
    </div>
  );
}