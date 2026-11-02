import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };

export default function Teams() {
  return (
    <CapabilityCard<Team, 'teams'>
      title="Teams"
      description="Manage teams and members."
      endpoint="/api/teams"
      responseKey="teams"
      emptyMessage="No teams yet."
      renderItem={(team) => <>{team.name} <span>({team.members.length} members)</span></>}
    />
  );
}
