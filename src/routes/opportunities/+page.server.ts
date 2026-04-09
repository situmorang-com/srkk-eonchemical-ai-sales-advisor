import type { PageServerLoad } from './$types';
import { getAllOpportunities } from '$lib/server/repositories/opportunity.repository';

export const load: PageServerLoad = async () => {
	const opportunities = await getAllOpportunities();
	return { opportunities };
};
