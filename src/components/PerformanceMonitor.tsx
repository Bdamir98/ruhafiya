'use client'

import { useEffect } from 'react'
import Script from 'next/script'

interface PerformanceMonitorProps {
  enableGoogleAnalytics?: boolean
  enableWebVitals?: boolean
  enableErrorTracking?: boolean
  googleAnalyticsId?: string
}

export default function PerformanceMonitor({
  enableGoogleAnalytics = true,
  enableWebVitals = true,
  enableErrorTracking = true,
  googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID,
}: PerformanceMonitorProps) {

  useEffect(() => {
    // Basic performance monitoring
    if (enableWebVitals && typeof window !== 'undefined') {
      initBasicPerformanceMonitoring()
    }

    // Error tracking
    if (enableErrorTracking) {
      window.addEventListener('error', handleError)
      window.addEventListener('unhandledrejection', handleUnhandledRejection)
      
      return () => {
        window.removeEventListener('error', handleError)
        window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      }
    }
  }, [enableWebVitals, enableErrorTracking])

  const initBasicPerformanceMonitoring = () => {
    // Basic performance monitoring without web-vitals library
    if (typeof window !== 'undefined' && window.performance) {
      // Monitor page load time
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          sendToAnalytics({
            name: 'page_load_time',
            value: navigation.loadEventEnd - navigation.loadEventStart,
            id: 'basic-' + Date.now(),
          })
        }
      })
    }
  }

  const sendToAnalytics = (metric: any) => {
    // Send to Google Analytics
    if (enableGoogleAnalytics && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      })
    }

    // Send to custom analytics endpoint
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    }).catch(console.error)
  }

  const handleError = (event: ErrorEvent) => {
    const errorData = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    }

    // Send to error tracking service
    fetch('/api/analytics/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData),
    }).catch(console.error)

    // Send to Google Analytics
    if (enableGoogleAnalytics && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: event.message,
        fatal: false,
      })
    }
  }

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const errorData = {
      message: 'Unhandled Promise Rejection',
      reason: event.reason?.toString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    }

    fetch('/api/analytics/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData),
    }).catch(console.error)
  }

  return (
    <>
      {/* Google Analytics */}
      {enableGoogleAnalytics && googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}', {
                page_title: document.title,
                page_location: window.location.href,
                custom_map: {
                  'custom_dimension_1': 'user_type',
                  'custom_dimension_2': 'page_category'
                }
              });
              
              // Enhanced ecommerce tracking
              gtag('config', '${googleAnalyticsId}', {
                custom_map: {
                  'custom_dimension_3': 'product_category',
                  'custom_dimension_4': 'user_journey_stage'
                }
              });
            `}
          </Script>
        </>
      )}

      {/* Facebook Pixel */}
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>

      {/* Hotjar */}
      {process.env.NEXT_PUBLIC_HOTJAR_ID && (
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      )}

      {/* Performance Observer for additional metrics */}
      <Script id="performance-observer" strategy="afterInteractive">
        {`
          if ('PerformanceObserver' in window) {
            // Observe navigation timing
            const navObserver = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.entryType === 'navigation') {
                  const navEntry = entry;
                  
                  // Send navigation timing to analytics
                  fetch('/api/analytics/navigation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                      loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                      firstByte: navEntry.responseStart - navEntry.requestStart,
                      url: window.location.href,
                      timestamp: Date.now()
                    })
                  }).catch(console.error);
                }
              }
            });
            
            navObserver.observe({ entryTypes: ['navigation'] });
            
            // Observe resource timing
            const resourceObserver = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.duration > 1000) { // Only track slow resources
                  fetch('/api/analytics/resources', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: entry.name,
                      duration: entry.duration,
                      size: entry.transferSize,
                      type: entry.initiatorType,
                      url: window.location.href,
                      timestamp: Date.now()
                    })
                  }).catch(console.error);
                }
              }
            });
            
            resourceObserver.observe({ entryTypes: ['resource'] });
          }
        `}
      </Script>
    </>
  )
}

// Custom hook for tracking user interactions
export function useAnalytics() {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, parameters)
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', eventName, parameters)
    }

    // Custom analytics
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        parameters,
        url: window.location.href,
        timestamp: Date.now(),
      }),
    }).catch(console.error)
  }

  const trackPurchase = (value: number, currency: string = 'BDT', items?: any[]) => {
    trackEvent('purchase', {
      value,
      currency,
      items,
    })
  }

  const trackAddToCart = (itemId: string, itemName: string, value: number) => {
    trackEvent('add_to_cart', {
      currency: 'BDT',
      value,
      items: [{
        item_id: itemId,
        item_name: itemName,
        price: value,
        quantity: 1,
      }],
    })
  }

  const trackPageView = (pagePath?: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: pagePath || window.location.pathname,
      })
    }
  }

  return {
    trackEvent,
    trackPurchase,
    trackAddToCart,
    trackPageView,
  }
}
