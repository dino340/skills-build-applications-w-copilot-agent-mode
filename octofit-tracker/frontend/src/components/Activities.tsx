import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

const loadActivities = () => getJson<{ activities: Activity[] }>('/api/activities').then(({ activities }) => activities);

export default function Activities() {
  return (
    <CapabilityCard<Activity>
      title="Activities"
      description="Track student activity minutes and points."
      loadItems={loadActivities}
      emptyMessage="No activities yet."
      renderItem={(activity) => `${activity.type} - ${activity.minutes} minutes, ${activity.points} points`}
    />
  );
}
