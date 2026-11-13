import { revalidatePath } from 'next/cache';

/** Called by the CMS after every save so visitors see changes immediately. */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get('x-revalidate-secret') !== secret) {
    return Response.json({ ok: false, message: 'Invalid secret' }, { status: 401 });
  }
  revalidatePath('/', 'layout');
  revalidatePath('/[lang]', 'layout'); // every language
  return Response.json({ ok: true, revalidated: true, now: Date.now() });
}
