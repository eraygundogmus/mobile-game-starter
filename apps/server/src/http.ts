export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/** Reads a JSON object body of at most maxBytes. */
export async function readJson(request: Request, maxBytes = 32_768): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError(413, 'too_large');
  try {
    const value: unknown = JSON.parse(text);
    if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  } catch {
    // Falls through to the error below.
  }
  throw new HttpError(400, 'bad_json');
}

/** Adds CORS headers when the request origin is allowed. The API uses no cookies. */
export function withCors(response: Response, origin: string | null, allowed: string): Response {
  const list = allowed.split(',').map((o) => o.trim());
  const allow = list.includes('*') ? '*' : origin && list.includes(origin) ? origin : null;
  if (!allow) return response;
  const headers = new Headers(response.headers);
  headers.set('access-control-allow-origin', allow);
  headers.set('access-control-allow-methods', 'GET, POST, OPTIONS');
  headers.set('access-control-allow-headers', 'content-type');
  headers.set('access-control-max-age', '86400');
  if (allow !== '*') headers.append('vary', 'origin');
  return new Response(response.body, { status: response.status, headers });
}
