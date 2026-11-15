import React from 'react';
import { AlertTriangle } from 'lucide-react';
import useAstroPoints from '@/hooks/useAstroPoints';
import PointsCelebration from '@/components/points/PointsCelebration';
import PointsHero from '@/components/points/PointsHero';
import ChallengeList from '@/components/points/ChallengeList';
import StreakCard from '@/components/points/StreakCard';
import BreakdownCard from '@/components/points/BreakdownCard';
import LeaderboardCard from '@/components/points/LeaderboardCard';
import TransactionList from '@/components/points/TransactionList';

export default function AstroPoints() {
  const { data, awards, error, busy, refresh, clearAwards } = useAstroPoints();

  const handleRefresh = () => {
    refresh({ celebrate: true }).catch(() => {});
  };

  return (
    <div className="space-y-5">
      <PointsCelebration awards={awards} onDone={clearAwards} />

      <header>
        <p className="eyebrow flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary" />
          Gamification
        </p>
        <h1 className="mt-2 text-[24px] leading-[1.15] sm:text-[29px]">AstroPoints</h1>
        <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
          Earn points for the habits that protect a crew: movement goals, mobility sessions, recovery routines, sleep and
          the daily challenges. Every award is validated against your tracked records, credited once, and never based on
          a medical measurement.
        </p>
      </header>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12px] text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <PointsHero data={data} busy={busy} onRefresh={handleRefresh} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChallengeList challenges={data?.challenges} />
        <div className="space-y-4">
          <StreakCard streak={data?.streak} />
          <BreakdownCard breakdown={data?.breakdown} />
        </div>
      </div>

      <LeaderboardCard />

      <TransactionList transactions={data?.recent} />
    </div>
  );
}