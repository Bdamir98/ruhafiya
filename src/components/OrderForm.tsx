'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { ShoppingCart, Plus, Minus, Phone, MapPin, User, CreditCard } from 'lucide-react'

const orderSchema = z.object({
  customerName: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে'),
  customerPhone: z.string().min(11, 'সঠিক মোবাইল নম্বর দিন'),
  customerAddress: z.string().min(10, 'সম্পূর্ণ ঠিকানা দিন'),
})

type OrderFormData = z.infer<typeof orderSchema>

interface OrderFormProps {
  content?: {
    title?: string
    subtitle?: string
    singlePrice?: number
    bundlePrice?: number
    singlePackageImage?: string
    bundlePackageImage1?: string
    bundlePackageImage2?: string
  }
}

export default function OrderForm({ content }: OrderFormProps) {
  const [selectedPackage, setSelectedPackage] = useState<'single' | 'bundle'>('single')
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const defaultContent = {
    title: "অর্ডার করুন",
    subtitle: "নিচের ফর্মটি পূরণ করে আপনার অর্ডার সম্পন্ন করুন",
    singlePrice: 850,
    bundlePrice: 1550,
    singlePackageImage: "https://ugfrjijagqiwpviqiwbi.supabase.co/storage/v1/object/public/product-images/products/1754507239418_5w3jhv0czjv.png",
    bundlePackageImage1: "https://ugfrjijagqiwpviqiwbi.supabase.co/storage/v1/object/public/product-images/products/1754507278237_qepjrewad7.png",
    bundlePackageImage2: "https://ugfrjijagqiwpviqiwbi.supabase.co/storage/v1/object/public/product-images/products/1754507281859_7i5kmkhjrln.png"
  }

  const formContent = { ...defaultContent, ...content }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema)
  })

  const calculateTotal = () => {
    if (selectedPackage === 'bundle') {
      return formContent.bundlePrice * quantity
    }
    return formContent.singlePrice * quantity
  }

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true)
    
    try {
      const orderData = {
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        customer_address: data.customerAddress,
        product_quantity: selectedPackage === 'bundle' ? quantity * 2 : quantity,
        total_amount: calculateTotal(),
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('orders')
        .insert([orderData])

      if (error) throw error

      setOrderSuccess(true)
      reset()
      setQuantity(1)
      setSelectedPackage('single')
    } catch (error) {
      console.error('Order submission error:', error)
      alert('অর্ডার সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderSuccess) {
    return (
      <section id="order-section" className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-3xl p-12 shadow-2xl">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShoppingCart className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                অর্ডার সফল হয়েছে!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।
              </p>
              <button
                onClick={() => setOrderSuccess(false)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300"
              >
                নতুন অর্ডার করুন
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="order-section" className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            {formContent.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {formContent.subtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Selection */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">প্যাকেজ নির্বাচন করুন</h3>
              
              {/* Single Package */}
              <div
                className={`relative bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 ${
                  selectedPackage === 'single' 
                    ? 'border-emerald-500 shadow-lg' 
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
                onClick={() => setSelectedPackage('single')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center overflow-hidden">
                      {formContent.singlePackageImage ? (
                        <img
                          src={formContent.singlePackageImage}
                          alt="Ruhafiya Single Package"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <span className="text-emerald-700 font-bold text-sm">Ruhafiya</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">একক প্যাকেজ</h4>
                      <p className="text-gray-600">১টি বোতল</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">৳{formContent.singlePrice}</div>
                    <div className="text-sm text-gray-500">ফ্রি ডেলিভারি</div>
                  </div>
                </div>
                {selectedPackage === 'single' && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Bundle Package */}
              <div
                className={`relative bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 ${
                  selectedPackage === 'bundle' 
                    ? 'border-emerald-500 shadow-lg' 
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
                onClick={() => setSelectedPackage('bundle')}
              >
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  ১৫০ টাকা ছাড়
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {formContent.bundlePackageImage1 ? (
                          <img
                            src={formContent.bundlePackageImage1}
                            alt="Ruhafiya Bundle Package 1"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-emerald-700 font-bold text-xs">Ruhafiya</span>
                        )}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {formContent.bundlePackageImage2 ? (
                          <img
                            src={formContent.bundlePackageImage2}
                            alt="Ruhafiya Bundle Package 2"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-emerald-700 font-bold text-xs">Ruhafiya</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">বান্ডেল প্যাকেজ</h4>
                      <p className="text-gray-600">২টি বোতল + বোনাস</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400 line-through">৳১,৭00</div>
                    <div className="text-2xl font-bold text-emerald-600">৳{formContent.bundlePrice}</div>
                    <div className="text-sm text-gray-500">ফ্রি ডেলিভারি</div>
                  </div>
                </div>
                {selectedPackage === 'bundle' && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">পরিমাণ</h4>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors duration-300"
                  >
                    <Minus className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-2xl font-bold text-gray-800 min-w-[3rem] text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors duration-300"
                  >
                    <Plus className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6">
                <h4 className="text-lg font-bold mb-4">অর্ডার সামারি</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>প্যাকেজ:</span>
                    <span>{selectedPackage === 'bundle' ? 'বান্ডেল' : 'একক'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>পরিমাণ:</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ডেলিভারি:</span>
                    <span>ফ্রি</span>
                  </div>
                  <hr className="border-white/30" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>মোট:</span>
                    <span>৳{calculateTotal()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Form */}
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">আপনার তথ্য</h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    আপনার নাম *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('customerName')}
                      type="text"
                      className="w-full pl-12 pr-4 py-5 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 text-gray-800 bg-gray-50 hover:bg-white transition-all duration-300 touch-manipulation"
                      placeholder="আপনার পূর্ণ নাম লিখুন"
                      autoComplete="name"
                    />
                  </div>
                  {errors.customerName && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
                  )}
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    মোবাইল নম্বর *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('customerPhone')}
                      type="tel"
                      className="w-full pl-12 pr-4 py-5 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 text-gray-800 bg-gray-50 hover:bg-white transition-all duration-300 touch-manipulation"
                      placeholder="০১৭xxxxxxxx"
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </div>
                  {errors.customerPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerPhone.message}</p>
                  )}
                </div>

                {/* Customer Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    সম্পূর্ণ ঠিকানা *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <textarea
                      {...register('customerAddress')}
                      rows={4}
                      className="w-full pl-12 pr-4 py-5 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 text-gray-800 bg-gray-50 hover:bg-white transition-all duration-300 resize-none touch-manipulation"
                      placeholder="বাড়ি/ফ্ল্যাট নম্বর, রোড নম্বর, এলাকা, থানা, জেলা"
                      autoComplete="street-address"
                    />
                  </div>
                  {errors.customerAddress && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerAddress.message}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="bg-emerald-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-emerald-600" />
                    <div>
                      <h4 className="font-semibold text-gray-800">পেমেন্ট পদ্ধতি</h4>
                      <p className="text-sm text-gray-600">ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা দিন)</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[60px] text-base lg:text-lg"
                >
                  {isSubmitting ? 'অর্ডার প্রসেসিং...' : `কনফার্ম অর্ডার - ৳${calculateTotal()}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}