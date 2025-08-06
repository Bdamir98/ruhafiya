'use client'

import { Check, Truck, Gift, Clock } from 'lucide-react'

interface PricingProps {
  content?: {
    title?: string
    subtitle?: string
    originalPrice?: number
    offerPrice?: number
    bundleOriginalPrice?: number
    bundleOfferPrice?: number
    bundleDiscount?: number
    features?: string[]
    singlePackageImage?: string
    bundlePackageImage1?: string
    bundlePackageImage2?: string
  }
}

export default function Pricing({ content }: PricingProps) {
  const defaultContent = {
    title: "বিশেষ অফার মূল্য",
    subtitle: "সীমিত সময়ের জন্য বিশেষ ছাড়",
    originalPrice: 1350,
    offerPrice: 850,
    bundleOriginalPrice: 2700,
    bundleOfferPrice: 1550,
    bundleDiscount: 1150,
    features: [
      "ফ্রি হোম ডেলিভারি",
      "ক্যাশ অন ডেলিভারি",
      "১০০% মানি ব্যাক গ্যারান্টি",
      "২৪/৭ কাস্টমার সাপোর্ট"
    ],
    singlePackageImage: "",
    bundlePackageImage1: "",
    bundlePackageImage2: ""
  }

  const pricingContent = { ...defaultContent, ...content }

  const singleDiscount = Math.round(((pricingContent.originalPrice - pricingContent.offerPrice) / pricingContent.originalPrice) * 100)

  const scrollToOrder = () => {
    document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 bengali-text" style={{ lineHeight: '1.3', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
            {pricingContent.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto bengali-text" style={{ lineHeight: '1.7', paddingTop: '0.25rem', paddingBottom: '0.25rem' }}>
            {pricingContent.subtitle}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Single Product */}
          <div className="relative bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-2">
            {/* Discount Badge */}
            <div className="absolute -top-4 left-8 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-lg rounded-2xl bengali-text" style={{ padding: '0.75rem 1.5rem', lineHeight: '1.4' }}>
              {singleDiscount}% ছাড়
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 bengali-text card-title" style={{ lineHeight: '1.5', paddingTop: '0.25rem', paddingBottom: '0.25rem' }}>একক প্যাকেজ</h3>
              
              {/* Product Image */}
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mx-auto mb-6 flex items-center justify-center overflow-hidden">
                {pricingContent.singlePackageImage ? (
                  <img
                    src={pricingContent.singlePackageImage}
                    alt="Ruhafiya Single Package"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-20 h-20 bg-emerald-300 rounded-full flex items-center justify-center">
                    <span className="text-emerald-700 font-bold">Ruhafiya</span>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <div className="text-gray-500 line-through text-lg mb-2 price-text">
                  ৳{pricingContent.originalPrice}
                </div>
                <div className="text-4xl font-bold text-emerald-600 mb-2 price-text">
                  ৳{pricingContent.offerPrice}
                </div>
                <div className="text-gray-600 bengali-text" style={{ lineHeight: '1.6' }}>প্রতি বোতল</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {pricingContent.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 bengali-text" style={{ lineHeight: '1.6' }}>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={scrollToOrder}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              এখনই অর্ডার করুন
            </button>
          </div>

          {/* Bundle Package */}
          <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl transform hover:-translate-y-2 transition-all duration-300 text-white">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg">
              সবচেয়ে জনপ্রিয়
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">বান্ডেল প্যাকেজ</h3>
              
              {/* Product Images */}
              <div className="flex justify-center gap-4 mb-6">
                <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
                  {pricingContent.bundlePackageImage1 ? (
                    <img
                      src={pricingContent.bundlePackageImage1}
                      alt="Ruhafiya Bundle Package 1"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Ruhafiya</span>
                    </div>
                  )}
                </div>
                <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
                  {pricingContent.bundlePackageImage2 ? (
                    <img
                      src={pricingContent.bundlePackageImage2}
                      alt="Ruhafiya Bundle Package 2"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Ruhafiya</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <div className="text-emerald-200 line-through text-lg mb-2">
                  ৳{pricingContent.bundleOriginalPrice}
                </div>
                <div className="text-4xl font-bold mb-2">
                  ৳{pricingContent.bundleOfferPrice}
                </div>
                <div className="text-emerald-200">২টি বোতল</div>
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mt-3">
                  <Gift className="w-5 h-5" />
                  <span className="font-semibold">৳{pricingContent.bundleDiscount} অতিরিক্ত ছাড়!</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {pricingContent.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white">{feature}</span>
                </div>
              ))}
              
            </div>

            {/* CTA Button */}
            <button
              onClick={scrollToOrder}
              className="w-full bg-white text-emerald-600 hover:text-emerald-700 font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              বান্ডেল অর্ডার করুন
            </button>
          </div>
        </div>

        

        {/* Bottom Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-800 mb-2">ফ্রি ডেলিভারি</h4>
            <p className="text-gray-600">সারাদেশে ফ্রি হোম ডেলিভারি</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-800 mb-2">দ্রুত ডেলিভারি</h4>
            <p className="text-gray-600">২৪-৪৮ ঘন্টার মধ্যে ডেলিভারি</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-800 mb-2">গ্যারান্টি</h4>
            <p className="text-gray-600">১০০% মানি ব্যাক গ্যারান্টি</p>
          </div>
        </div>
      </div>
    </section>
  )
}