import type { PageServerLoad } from './$types';
import { getDashboardData } from '$lib/server/services/dashboard.service';

export const load: PageServerLoad = async () => {
	const data = await getDashboardData();
	return { dashboard: data };
};
