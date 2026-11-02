import { CapabilityCard } from './CapabilityCard.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return (
    <CapabilityCard<Entry, 'leaderboard'>
      title="Leaderboard"
      description="Compare team point totals."
      endpoint="/api/leaderboard"
      responseKey="leaderboard"
      emptyMessage="No leaderboard rankings yet."
      renderItem={(entry) => `#${entry.rank} ${entry.teamName} - ${entry.totalPoints} points`}
    />
  );
}
