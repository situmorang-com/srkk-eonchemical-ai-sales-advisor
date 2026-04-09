import type { RequestHandler } from './$types';
import { generateRecommendation } from '$lib/server/services/recommendation.engine';
import { json, error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { opportunityId } = await request.json();
		if (!opportunityId) throw error(400, 'opportunityId is required');
		const rec = await generateRecommendation(opportunityId);
		if (!rec) throw error(404, 'No recommendation could be generated');
		return json(rec);
	} catch (e) {
		console.error('Recommendation API error:', e);
		throw error(500, 'Failed to generate recommendation');
	}
};
