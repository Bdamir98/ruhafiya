import type { NextRequest } from 'next/server';

const FB_GRAPH_VERSION = 'v17.0';

export function getFbp(req: NextRequest): string | undefined {
  const cookie = req.cookies.get('_fbp')?.value;
  return cookie || undefined;
}

export function getFbc(req: NextRequest): string | undefined {
  // fbc is often set when the user lands from an ad; sometimes captured via URL param fbclid
  const fromCookie = req.cookies.get('_fbc')?.value;
  const url = new URL(req.url);
  const fbclid = url.searchParams.get('fbclid');
  if (fromCookie) return fromCookie;
  if (fbclid) {
    // Format per Meta docs: fb.1.<timestamp>.<fbclid>
    return `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid}`;
  }
  return undefined;
}

export function getClientIp(req: NextRequest): string | undefined {
  const hdrs = req.headers;
  return (
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    hdrs.get('x-real-ip') ||
    undefined
  ) as string | undefined;
}

export async function sendServerEvent(params: {
  pixelId: string;
  accessToken: string;
  eventName: string;
  eventTime?: number;
  eventSourceUrl?: string;
  actionSource?: 'website';
  userAgent?: string;
  clientIp?: string;
  fbp?: string;
  fbc?: string;
  eventId?: string;
  customData?: Record<string, any>;
}): Promise<{ ok: boolean; status: number; body: any }> {
  const {
    pixelId,
    accessToken,
    eventName,
    eventTime = Math.floor(Date.now() / 1000),
    eventSourceUrl,
    actionSource = 'website',
    userAgent,
    clientIp,
    fbp,
    fbc,
    eventId,
    customData,
  } = params;

  const userData: Record<string, any> = {};
  if (clientIp) userData.client_ip_address = clientIp;
  if (userAgent) userData.client_user_agent = userAgent;
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const body = {
    data: [
      {
        event_name: eventName,
        event_time: eventTime,
        action_source: actionSource,
        event_source_url: eventSourceUrl,
        event_id: eventId,
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${pixelId}/events?access_token=${accessToken}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {}
  return { ok: res.ok, status: res.status, body: json };
}
