const BACKEND_URL = 'http://backend:8000';

export async function POST(req: Request) {
  const body = await req.text();

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND_URL}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  } catch {
    return new Response('Backend unreachable', { status: 502 });
  }

  if (!backendRes.ok || !backendRes.body) {
    return new Response('Upstream error', { status: 502 });
  }

  return new Response(backendRes.body, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}