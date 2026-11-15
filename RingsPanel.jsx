import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Panel from '@/components/common/Panel';
import Ring from '@/components/charts/Ring';
import { COLORS, formatDate } from '@/lib/health';

export default function RingsPanel({ activity }) {
  const rings = [
    {
      key: 'movement',
      label: 'Movement',
      value: activity?.movement_minutes ?? 0,
      goal: activity?.movement_goal ?? 45,
      unit: 'min',
      color: COLORS.cyan,
    },
    {
      key: 'mobility',
      label: 'Mobility',
      value: activity?.mobility_minutes ?? 0,
      goal: activity?.mobility_goal ?? 30,
      unit: 'min',
      color: COLORS.violet,
    },
    {
      key: 'recovery',
      label: 'Recovery',
      value: activity?.recovery_score ?? 0,
      goal: activity?.recovery_goal ?? 80,
      unit: 'score',
      color: COLORS.mint,
    },
  ];

  return (
    <Panel
      eyebrow="Today's rings"
      title="Close your three rings"
      subtitle={activity ? `Measured ${formatDate(activity.date, 'ddd, MMM D')}` : 'Nothing recorded yet'}
      action={
        <Link
          to="/movement"
          className="inline-flex items-center gap-1 rounded-full border border-hairline px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-brand-cyan/40 hover:text-foreground"
        >
          Activity <ArrowUpRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-3 sm:gap-4">
        {rings.map((ring, index) => (
          <div key={ring.key} className="flex justify-center">
            <Ring
              value={ring.value}
              goal={ring.goal}
              color={ring.color}
              label={ring.label}
              size={158}
              delay={index * 0.12}
              caption={`${Math.round(ring.value)} / ${ring.goal} ${ring.unit}`}
            />
          </div>
        ))}
      </div>
    </Panel>
  );
}