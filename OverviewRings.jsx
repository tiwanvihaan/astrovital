import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Panel from '@/components/common/Panel';
import Ring from '@/components/charts/Ring';
import { MOBILITY_GOAL, MOVEMENT_GOAL_MINUTES } from '@/lib/tracking';

/**
 * The three rings: movement minutes, mobility score and recovery score.
 * Each value comes from stored records; anything not logged is shown as 0 with no caption maths.
 */
export default function OverviewRings({ movement, mobility, recovery }) {
  const rings = [
    {
      key: 'movement',
      label: 'Movement',
      value: movement?.todayMinutes ?? 0,
      goal: MOVEMENT_GOAL_MINUTES,
      color: 'primary',
      caption: `${Math.round(movement?.todayMinutes ?? 0)} / ${MOVEMENT_GOAL_MINUTES} min today`,
      to: '/movement',
    },
    {
      key: 'mobility',
      label: 'Mobility',
      value: mobility?.score ?? 0,
      goal: MOBILITY_GOAL,
      color: 'secondary',
      caption: mobility?.score == null ? 'Not assessed yet' : `${mobility.score} / ${MOBILITY_GOAL} score`,
      to: '/mobility',
    },
    {
      key: 'recovery',
      label: 'Recovery',
      value: recovery?.score ?? 0,
      goal: 80,
      color: 'success',
      caption: recovery?.score == null ? 'Check-in pending' : `${recovery.score} / 100 score`,
      to: '/',
    },
  ];

  return (
    <Panel
      eyebrow="Today's rings"
      title="Close your three rings"
      subtitle="Movement from sensors or manual logs · mobility from your assessments · recovery from your check-in."
      action={
        <Link
          to="/movement"
          className="inline-flex items-center gap-1 rounded-full border border-hairline px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/45 hover:text-foreground"
        >
          Activity <ArrowUpRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
        {rings.map((ring, index) => (
          <div key={ring.key} className="flex justify-center">
            <Ring
              value={ring.value}
              goal={ring.goal}
              color={ring.color}
              label={ring.label}
              size={158}
              delay={index * 0.12}
              caption={ring.caption}
            />
          </div>
        ))}
      </div>
    </Panel>
  );
}