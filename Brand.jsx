import React from 'react';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';
import { BRAND_LOGO } from '@/lib/brand';

export default function Brand({ compact = false, className }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <Image
        src={BRAND_LOGO}
        alt="AstroVital"
        fittingType="fit"
        className={cn('w-auto max-w-full object-contain', compact ? 'h-6' : 'h-7')} />
      
      {!compact && <p className="eyebrow">The Future of space intelligience</p>}
    </div>);

}