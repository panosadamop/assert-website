import { API_URL } from '@/lib/cms';

/** Serves CMS media (/uploads/...) from this domain by streaming it from the CMS. */
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (path.some((p) => p === '..' || p.startsWith('.'))) return new Response('Not found', { status: 404 });
  const upstream = await fetch(`${API_URL}/uploads/${path.map(encodeURIComponent).join('/')}`, {
    headers: { 'if-none-match': req.headers.get('if-none-match') || '' },
    cache: 'no-store',
  }).catch(() => null);
  if (!upstream || (!upstream.ok && upstream.status !== 304)) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  for (const h of ['content-type', 'content-length', 'etag', 'last-modified']) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set('cache-control', 'public, max-age=604800, stale-while-revalidate=86400');
  return new Response(upstream.body, { status: upstream.status, headers });
}
