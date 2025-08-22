import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIp, getFbc, getFbp, sendServerEvent } from '@/lib/fb';

const BodySchema = z.object({
  eventName: z.string(),
  eventId: z.string().optional(),
  eventSourceUrl: z.string().url().optional(),
  customData: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = BodySchema.parse(json);

    const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
    const accessToken = process.env.FB_CAPI_ACCESS_TOKEN || process.env.FB_CONVERSION_API_TOKEN;
    if (!pixelId || !accessToken) {
      return NextResponse.json({ error: 'FB Pixel or Access Token not configured' }, { status: 500 });
    }

    const fbp = getFbp(req);
    const fbc = getFbc(req);
    const clientIp = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || undefined;

    const res = await sendServerEvent({
      pixelId,
      accessToken,
      eventName: body.eventName,
      eventId: body.eventId,
      eventSourceUrl: body.eventSourceUrl,
      actionSource: 'website',
      userAgent,
      clientIp,
      fbp,
      fbc,
      customData: body.customData,
    });

    return NextResponse.json({ ok: res.ok, status: res.status, body: res.body });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues?.[0]?.message ?? 'Invalid payload' }, { status: 400 });
    }
    console.error('FB track error:', e);
    return NextResponse.json({ error: 'Failed to send event' }, { status: 500 });
  }
}
