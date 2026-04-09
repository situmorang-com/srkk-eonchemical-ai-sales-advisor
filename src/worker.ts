const APP_BASE = "/srkk-eonchemicals";

type Env = {
	ASSETS: Fetcher;
};

function isAssetPath(pathname: string) {
	return /\.[a-zA-Z0-9]+$/.test(pathname);
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (!url.pathname.startsWith(APP_BASE)) {
			return env.ASSETS.fetch(request);
		}

		if (request.method !== "GET" && request.method !== "HEAD") {
			return env.ASSETS.fetch(request);
		}

		if (isAssetPath(url.pathname) || url.pathname.startsWith(`${APP_BASE}/_app/`)) {
			return env.ASSETS.fetch(request);
		}

		const assetResponse = await env.ASSETS.fetch(request);
		if (assetResponse.status !== 404) {
			return assetResponse;
		}

		const appShellUrl = new URL(`${APP_BASE}/`, url);
		return env.ASSETS.fetch(new Request(appShellUrl, request));
	}
};
