import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Suggestion = { title: string; reason: string };

const loadSuggestions = () => getJson<{ suggestions: Suggestion[] }>(
  `/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`,
).then(({ suggestions }) => suggestions);

export default function Workouts() {
  return (
    <CapabilityCard<Suggestion>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      loadItems={loadSuggestions}
      emptyMessage="No workout suggestions yet."
      renderItem={(suggestion) => <><strong>{suggestion.title}</strong>: {suggestion.reason}</>}
    />
  );
}
