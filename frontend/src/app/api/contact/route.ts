import { API_URL } from '@/lib/cms';

/** Forwards contact-form submissions to the CMS (keeps the CMS URL private). */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ message: 'Invalid request' }, { status: 400 });
  }
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '').split(',')[0].trim();
  try {
    const res = await fetch(`${API_URL}/api/public/contact`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(ip ? { 'x-forwarded-for': ip } : {}) },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 429) return Response.json({ message: 'Too many messages. Please try again in a minute.' }, { status: 429 });
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ message: 'The message could not be sent right now. Please email us instead.' }, { status: 502 });
  }
}
