import Script from 'next/script'

interface StructuredDataProps {
  type?: 'product' | 'organization' | 'website' | 'breadcrumb'
  data?: any
}

export default function StructuredData({ type = 'product', data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ruhafiya.com'
    
    switch (type) {
      case 'product':
        return {
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": "রুহাফিয়া প্রাকৃতিক ব্যথানাশক তেল",
          "alternateName": "Ruhafiya Natural Pain Relief Oil",
          "description": "রুহাফিয়া প্রাকৃতিক ব্যথানাশক তেল - জয়েন্ট পেইন, মাসল পেইন, আর্থ্রাইটিসের জন্য কার্যকর সমাধান। ১০০% প্রাকৃতিক উপাদান, পার্শ্বপ্রতিক্রিয়া মুক্ত।",
          "image": [
            `${baseUrl}/images/ruhafiya-product.jpg`,
            `${baseUrl}/images/ruhafiya-bottle.jpg`,
            `${baseUrl}/images/ruhafiya-ingredients.jpg`
          ],
          "brand": {
            "@type": "Brand",
            "name": "Ruhafiya"
          },
          "manufacturer": {
            "@type": "Organization",
            "name": "Ruhafiya Healthcare",
            "url": baseUrl
          },
          "category": "Health & Wellness",
          "offers": {
            "@type": "Offer",
            "url": `${baseUrl}/#order`,
            "priceCurrency": "BDT",
            "price": "890",
            "priceValidUntil": "2025-12-31",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "Ruhafiya Healthcare"
            },
            "shippingDetails": {
              "@type": "OfferShippingDetails",
              "shippingRate": {
                "@type": "MonetaryAmount",
                "value": "0",
                "currency": "BDT"
              },
              "deliveryTime": {
                "@type": "ShippingDeliveryTime",
                "handlingTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 1,
                  "maxValue": 2,
                  "unitCode": "DAY"
                },
                "transitTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 1,
                  "maxValue": 3,
                  "unitCode": "DAY"
                }
              }
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "127",
            "bestRating": "5",
            "worstRating": "1"
          },
          "review": [
            {
              "@type": "Review",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              },
              "author": {
                "@type": "Person",
                "name": "রহিমা খাতুন"
              },
              "reviewBody": "অসাধারণ কার্যকর! আমার হাঁটুর ব্যথা অনেক কমে গেছে।"
            }
          ],
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Ingredients",
              "value": "100% Natural Herbal Ingredients"
            },
            {
              "@type": "PropertyValue",
              "name": "Volume",
              "value": "50ml"
            },
            {
              "@type": "PropertyValue",
              "name": "Usage",
              "value": "External Use Only"
            }
          ]
        }

      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Ruhafiya Healthcare",
          "alternateName": "রুহাফিয়া",
          "url": baseUrl,
          "logo": `${baseUrl}/images/ruhafiya-logo.png`,
          "description": "প্রাকৃতিক ব্যথানাশক তেল ও স্বাস্থ্য পণ্যের বিশ্বস্ত ব্র্যান্ড",
          "foundingDate": "2020",
          "founders": [
            {
              "@type": "Person",
              "name": "Ruhafiya Team"
            }
          ],
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "BD",
            "addressRegion": "Dhaka"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+880-XXX-XXXXXX",
            "contactType": "customer service",
            "availableLanguage": ["Bengali", "English"]
          },
          "sameAs": [
            "https://facebook.com/ruhafiya",
            "https://instagram.com/ruhafiya",
            "https://youtube.com/ruhafiya"
          ]
        }

      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Ruhafiya",
          "alternateName": "রুহাফিয়া",
          "url": baseUrl,
          "description": "প্রাকৃতিক ব্যথানাশক তেল ও স্বাস্থ্য পণ্যের অনলাইন শপ",
          "inLanguage": ["bn-BD", "en-US"],
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${baseUrl}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Ruhafiya Healthcare",
            "logo": {
              "@type": "ImageObject",
              "url": `${baseUrl}/images/ruhafiya-logo.png`
            }
          }
        }

      case 'breadcrumb':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": baseUrl
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Products",
              "item": `${baseUrl}/products`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Ruhafiya Pain Relief Oil",
              "item": `${baseUrl}/products/ruhafiya-pain-relief-oil`
            }
          ]
        }

      default:
        return {}
    }
  }

  const structuredData = data || getStructuredData()

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}

// FAQ Structured Data Component
export function FAQStructuredData() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "রুহাফিয়া তেল কিভাবে ব্যবহার করবো?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ব্যথার স্থানে অল্প পরিমাণ তেল নিয়ে ৫-১০ মিনিট ম্যাসাজ করুন। দিনে ২-৩ বার ব্যবহার করুন।"
        }
      },
      {
        "@type": "Question",
        "name": "কতদিনে ফলাফল পাবো?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "সাধারণত ৭-১৪ দিনের মধ্যে উল্লেখযোগ্য উন্নতি দেখা যায়। তবে ব্যথার ধরন অনুযায়ী সময় ভিন্ন হতে পারে।"
        }
      },
      {
        "@type": "Question",
        "name": "কোন পার্শ্বপ্রতিক্রিয়া আছে কি?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "রুহাফিয়া ১০০% প্রাকৃতিক উপাদানে তৈরি, তাই কোন পার্শ্বপ্রতিক্রিয়া নেই। তবে অ্যালার্জি থাকলে ব্যবহারের আগে পরীক্ষা করে নিন।"
        }
      },
      {
        "@type": "Question",
        "name": "ডেলিভারি কতদিনে পাবো?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ঢাকার ভিতরে ১-২ দিন, ঢাকার বাইরে ২-৩ দিনের মধ্যে ডেলিভারি পাবেন। ক্যাশ অন ডেলিভারি সুবিধা আছে।"
        }
      }
    ]
  }

  return (
    <Script
      id="faq-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqData)
      }}
    />
  )
}
