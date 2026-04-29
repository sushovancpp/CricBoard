export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { store } from '../lib/store';

export async function GET() {
  return Response.json(store.match);
}
