import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };

const loadTeams = () => getJson<{ teams: Team[] }>('/api/teams').then(({ teams }) => teams);

export default function Teams() {
  return (
    <CapabilityCard<Team>
      title="Teams"
      description="Manage teams and members."
      loadItems={loadTeams}
      emptyMessage="No teams yet."
      renderItem={(team) => <>{team.name} <span>({team.members.length} members)</span></>}
    />
  );
}
