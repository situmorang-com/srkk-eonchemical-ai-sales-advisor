import type { RequestHandler } from './$types';
import { processCopilotMessage } from '$lib/server/services/copilot.service';
import { json, error } from '@sveltejs/kit';
import type { CopilotRequest } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body: CopilotRequest = await request.json();
		if (!body.message?.trim()) {
			throw error(400, 'Message is required');
		}
		const response = await processCopilotMessage(body);
		return json(response);
	} catch (e) {
		console.error('Copilot API error:', e);
		throw error(500, 'Failed to process message');
	}
};
