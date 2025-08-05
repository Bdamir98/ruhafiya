import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ruhafiya.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/products/',
          '/about',
          '/contact',
          '/testimonials',
          '/faq',
          '/privacy-policy',
          '/terms-of-service',
          '/shipping-policy',
          '/return-policy',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/private/',
          '*.json',
          '/admin/*',
          '/dashboard/*',
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/products/',
          '/about',
          '/contact',
          '/testimonials',
          '/faq',
          '/privacy-policy',
          '/terms-of-service',
          '/shipping-policy',
          '/return-policy',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/products/',
          '/about',
          '/contact',
          '/testimonials',
          '/faq',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/private/',
        ],
        crawlDelay: 2,
      },
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}