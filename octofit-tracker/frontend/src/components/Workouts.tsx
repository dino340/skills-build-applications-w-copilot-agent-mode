import { CapabilityCard } from './CapabilityCard.js';

type Suggestion = { title: string; reason: string };

export default function Workouts() {
  return (
    <CapabilityCard<Suggestion, 'suggestions'>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      endpoint={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
      responseKey="suggestions"
      emptyMessage="No workout suggestions yet."
      renderItem={(suggestion) => <><strong>{suggestion.title}</strong>: {suggestion.reason}</>}
    />
  );
}
