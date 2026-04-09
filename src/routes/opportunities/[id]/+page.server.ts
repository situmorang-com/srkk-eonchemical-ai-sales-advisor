import type { PageServerLoad } from './$types';
import { getOpportunityById } from '$lib/server/repositories/opportunity.repository';
import { getStoredRecommendation, generateRecommendation } from '$lib/server/services/recommendation.engine';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const opp = await getOpportunityById(params.id);
	if (!opp) throw error(404, 'Opportunity not found');

	// Load or generate recommendation
	let rec = await getStoredRecommendation(params.id);
	if (!rec) {
		rec = await generateRecommendation(params.id);
	}

	return { opp: { ...opp, recommendation: rec } };
};
