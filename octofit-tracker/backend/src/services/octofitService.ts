import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const badRequest = (message: string) => Object.assign(new Error(message), { status: 400 });
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw badRequest('Activity payload must be an object');
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (typeof userId !== 'string' || !Types.ObjectId.isValid(userId)) {
    throw badRequest('A valid userId is required');
  }
  if (typeof teamId !== 'string' || !Types.ObjectId.isValid(teamId)) {
    throw badRequest('A valid teamId is required');
  }
  if (typeof type !== 'string' || !type.trim()) {
    throw badRequest('An activity type is required');
  }
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw badRequest('Activity minutes must be a positive number');
  }

  const userObjectId = new Types.ObjectId(userId);
  const teamObjectId = new Types.ObjectId(teamId);
  const [userExists, teamExists] = await Promise.all([
    User.exists({ _id: userObjectId }),
    Team.exists({ _id: teamObjectId }),
  ]);
  if (!userExists || !teamExists) {
    throw badRequest('The specified user or team does not exist');
  }

  return Activity.create({
    user: userObjectId,
    team: teamObjectId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const badRequest = (message: string) => Object.assign(new Error(message), { status: 400 });
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw badRequest('Team payload must be an object');
  }

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim()) {
    throw badRequest('A team name is required');
  }
  if (typeof mascot !== 'string' || !mascot.trim()) {
    throw badRequest('A team mascot is required');
  }
  if (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !Types.ObjectId.isValid(member))) {
    throw badRequest('Team members must be valid user IDs');
  }

  const memberIds = [...new Set(members as string[])].map((member) => new Types.ObjectId(member));
  if (memberIds.length && await User.countDocuments({ _id: { $in: memberIds } }) !== memberIds.length) {
    throw badRequest('One or more team members do not exist');
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ teamName: string; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: Team.collection.name, localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $project: { _id: 0, teamName: '$team.name', totalPoints: 1 } },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);
  return totals.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const activityFocus = recentActivity?.type.toLowerCase() === 'run' || recentActivity?.type.toLowerCase() === 'cycle'
    ? 'endurance'
    : recentActivity?.type.toLowerCase();
  const goalFocus = user.fitnessGoal.toLowerCase();
  const workouts = await Workout.find().lean();
  const recommendations = workouts.flatMap((workout) => {
    const focus = workout.focus.toLowerCase();
    if (focus === goalFocus) {
      return [{
        ...workout,
        reason: recentActivity
          ? `Matches your ${focus} fitness goal and ${recentActivity.type} activity.`
          : `Matches your ${focus} fitness goal.`,
      }];
    }
    if (focus === activityFocus && recentActivity) {
      return [{ ...workout, reason: `Matches your ${recentActivity.type} activity pattern.` }];
    }
    return [];
  });
  return recommendations;
}

export { User };
