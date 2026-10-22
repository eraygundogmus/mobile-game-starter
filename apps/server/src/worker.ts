// game-api: a Cloudflare Worker. Routes are a small table; add one line per endpoint.
import { ENGINE_VERSION } from '@game/engine';
import type { Env } from './env';
import { HttpError, json, withCors } from './http';
import { getBoard, getDaily, submitRun } from './runs';

type Handler = (request: Request, env: Env, url: URL, now: number) => Promise<Response> | Response;

const routes: [method: string, path: string, handler: Handler][] = [
  ['GET', '/health', () => json({ ok: true, engine: ENGINE_VERSION })],
  ['GET', '/v1/daily', (_req, _env, _url, now) => getDaily(now)],
  ['POST', '/v1/runs', (req, env, _url, now) => submitRun(req, env, now)],
  ['GET', '/v1/leaderboard', (_req, env, url, now) => getBoard(url, env, now)],
];

async function handle(request: Request, env: Env): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  const url = new URL(request.url);
  const matches = routes.filter(([, path]) => path === url.pathname);
  if (matches.length === 0) return json({ error: 'not_found' }, 404);
  const route = matches.find(([method]) => method === request.method);
  if (!route) return json({ error: 'method_not_allowed' }, 405);
  try {
    // The clock is read here, once, and passed down. The engine never reads it.
    return await route[2](request, env, url, Date.now());
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.code }, err.status);
    console.error(err);
    return json({ error: 'internal' }, 500);
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    return withCors(await handle(request, env), request.headers.get('origin'), env.WEB_ORIGINS);
  },
} satisfies ExportedHandler<Env>;
