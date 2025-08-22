"use client";
import { useEffect } from 'react';
import Header from '@/react-app/components/Header';
import Hero from '@/react-app/components/Hero';
import Benefits from '@/react-app/components/Benefits';
import Offer from '@/react-app/components/Offer';
import Testimonials from '@/react-app/components/Testimonials';
import Safety from '@/react-app/components/Safety';
import OrderForm from '@/react-app/components/OrderForm';
import PaymentOptions from '@/react-app/components/PaymentOptions';
import Footer from '@/react-app/components/Footer';
import { websiteContent } from '@/shared/websiteContent';

export default function Home() {
  useEffect(() => {
    const makeEventId = () => {
      try {
        return (window.crypto && 'randomUUID' in window.crypto && (window.crypto as any).randomUUID()) || String(Date.now());
      } catch {
        return String(Date.now());
      }
    };
    const vcId = makeEventId();
    try {
      // ViewContent - product landing page view
      (window as any).fbq?.('track', 'ViewContent', {
        content_type: 'product',
        currency: 'BDT',
        content_category: 'Pain Removal Oil',
        content_ids: websiteContent.orderForm.packages.map((p) => String(p.id)),
      }, { eventID: vcId });
    } catch {}

    // Server-side CAPI mirror for resiliency
    try {
      fetch('/api/fb/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'ViewContent',
          eventId: vcId,
          eventSourceUrl: window.location.href,
          customData: {
            content_type: 'product',
            currency: 'BDT',
            content_category: 'Pain Removal Oil',
            content_ids: websiteContent.orderForm.packages.map((p) => String(p.id)),
          },
        }),
      }).catch((err) => console.warn('CAPI ViewContent mirror failed', err));
    } catch {}
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Benefits />
      <Offer />
      <Testimonials />
      <Safety />
      <OrderForm />
      <PaymentOptions />
      <Footer />
    </div>
  );
}
