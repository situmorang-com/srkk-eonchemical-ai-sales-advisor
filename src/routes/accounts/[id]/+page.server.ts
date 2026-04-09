import type { PageServerLoad } from './$types';
import { getAccountById } from '$lib/server/repositories/account.repository';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const account = await getAccountById(params.id);
	if (!account) throw error(404, 'Account not found');
	return { account };
};
