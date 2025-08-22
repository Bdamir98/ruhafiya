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

export default function Home() {
  useEffect(() => {
    try {
      // ViewContent - product landing page view
      (window as any).fbq?.('track', 'ViewContent', {
        content_type: 'product',
        currency: 'BDT',
      });
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
