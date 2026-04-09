import { db } from '../db';
import { activities, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import type { ActivityItem } from '$lib/types';

export async function getActivitiesByOpportunity(opportunityId: string): Promise<ActivityItem[]> {
	const rows = await db
		.select({
			id:              activities.id,
			type:            activities.type,
			subject:         activities.subject,
			description:     activities.description,
			outcome:         activities.outcome,
			activityDate:    activities.activityDate,
			durationMinutes: activities.durationMinutes,
			userName:        users.name
		})
		.from(activities)
		.leftJoin(users, eq(activities.userId, users.id))
		.where(eq(activities.opportunityId, opportunityId))
		.orderBy(desc(activities.activityDate));

	return rows.map((r) => ({
		id:              r.id,
		type:            r.type as ActivityItem['type'],
		subject:         r.subject,
		description:     r.description,
		outcome:         r.outcome,
		activityDate:    r.activityDate,
		durationMinutes: r.durationMinutes,
		userName:        r.userName ?? null
	}));
}
