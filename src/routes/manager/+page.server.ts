import type { PageServerLoad } from './$types';
import { getManagerDashboardData } from '$lib/server/services/dashboard.service';

export const load: PageServerLoad = async () => {
	const data = await getManagerDashboardData();
	return { managerData: data };
};
