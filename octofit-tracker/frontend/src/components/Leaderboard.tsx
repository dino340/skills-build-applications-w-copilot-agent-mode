import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

const loadLeaderboard = () => getJson<{ leaderboard: Entry[] }>('/api/leaderboard').then(({ leaderboard }) => leaderboard);

export default function Leaderboard() {
  return (
    <CapabilityCard<Entry>
      title="Leaderboard"
      description="Compare team point totals."
      loadItems={loadLeaderboard}
      emptyMessage="No leaderboard rankings yet."
      renderItem={(entry) => `#${entry.rank} ${entry.teamName} - ${entry.totalPoints} points`}
    />
  );
}
