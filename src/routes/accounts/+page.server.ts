import type { PageServerLoad } from './$types';
import { getAllAccounts } from '$lib/server/repositories/account.repository';

export const load: PageServerLoad = async () => {
	const accounts = await getAllAccounts();
	return { accounts };
};
