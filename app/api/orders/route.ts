import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OrderSchema } from '@/shared/types';
import { supabaseServer } from '@/lib/supabase-server';
import { getClientIp, getFbc, getFbp, sendServerEvent } from '@/lib/fb';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const orderData = OrderSchema.parse(json);

    const orderNumber = `RH${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const { data: product, error: productError } = await supabaseServer
      .from('products')
      .select('id, price')
      .eq('id', orderData.productId)
      .single();

    if (productError) throw productError;
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const shippingCharge = 100;
    const unitPrice = Number(product.price);
    const totalAmount = unitPrice * orderData.quantity + shippingCharge;

    const { error: insertError } = await supabaseServer.from('orders').insert({
      order_number: orderNumber,
      full_name: orderData.fullName,
      mobile_number: orderData.mobileNumber,
      full_address: orderData.fullAddress,
      product_id: orderData.productId,
      quantity: orderData.quantity,
      unit_price: unitPrice,
      shipping_charge: shippingCharge,
      total_amount: totalAmount,
      status: 'pending',
    });

    if (insertError) throw insertError;

    // Optional: Create notification if table exists
    try {
      await supabaseServer.from('notifications').insert({
        type: 'order',
        title: 'নতুন অর্ডার',
        message: `নতুন অর্ডার #${orderNumber} - ${orderData.fullName}`,
      });
    } catch {}

    // Facebook Conversion API: Purchase
    try {
      const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
      const accessToken = process.env.FB_CAPI_ACCESS_TOKEN;
      if (pixelId && accessToken) {
        const fbp = getFbp(req);
        const fbc = getFbc(req);
        const clientIp = getClientIp(req);
        const userAgent = req.headers.get('user-agent') || undefined;
        const eventId = orderNumber; // use order number for dedup with client event

        await sendServerEvent({
          pixelId,
          accessToken,
          eventName: 'Purchase',
          eventId,
          eventSourceUrl: req.headers.get('referer') || undefined,
          actionSource: 'website',
          userAgent,
          clientIp,
          fbp,
          fbc,
          customData: {
            value: totalAmount,
            currency: 'BDT',
            contents: [
              { id: String(orderData.productId), quantity: orderData.quantity, item_price: unitPrice },
            ],
            content_type: 'product',
            num_items: orderData.quantity,
          },
        });
      }
    } catch (e) {
      // don't fail the order if tracking fails
      console.warn('FB CAPI error:', e);
    }

    return NextResponse.json({ success: true, orderNumber, message: 'Order placed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues?.[0]?.message ?? 'Invalid data' }, { status: 400 });
    }
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
