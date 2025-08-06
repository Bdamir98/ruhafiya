'use client'

import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'

interface FooterProps {
  content?: {
    companyName?: string
    description?: string
    phone?: string
    email?: string
    address?: string
    socialLinks?: {
      facebook?: string
      instagram?: string
      youtube?: string
    }
  }
}

export default function Footer({ content }: FooterProps) {
  const defaultContent = {
    companyName: "Ruhafiya",
    description: "প্রাকৃতিক ব্যথা নিরাময়ের তেল - আপনার সুস্বাস্থ্যের জন্য প্রাকৃতিক সমাধান",
    phone: "+880 1XXX-XXXXXX",
    email: "info@ruhafiya.com",
    address: "ঢাকা, বাংলাদেশ",
    socialLinks: {
      facebook: "#",
      instagram: "#",
      youtube: "#"
    }
  }

  const footerContent = { ...defaultContent, ...content }

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-emerald-900 to-teal-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              {footerContent.companyName}
            </h3>
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              {footerContent.description}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href={footerContent.socialLinks.facebook}
                className="w-12 h-12 bg-white/10 hover:bg-emerald-500 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href={footerContent.socialLinks.instagram}
                className="w-12 h-12 bg-white/10 hover:bg-pink-500 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href={footerContent.socialLinks.youtube}
                className="w-12 h-12 bg-white/10 hover:bg-red-500 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110"
              >
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-6">দ্রুত লিংক</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-300 transition-colors duration-300">
                  আমাদের সম্পর্কে
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-300 transition-colors duration-300">
                  প্রোডাক্ট
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-300 transition-colors duration-300">
                  গ্রাহক পর্যালোচনা
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-300 transition-colors duration-300">
                  যোগাযোগ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-300 transition-colors duration-300">
                  রিফান্ড নীতি
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-bold mb-6">যোগাযোগ</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-gray-300">{footerContent.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-gray-300">{footerContent.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-gray-300">{footerContent.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-emerald-400 rounded-full"></div>
              </div>
              <div className="text-left">
                <h5 className="font-semibold text-emerald-300">১০০% প্রাকৃতিক</h5>
                <p className="text-sm text-gray-400">কোনো রাসায়নিক নেই</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-emerald-400 rounded-full"></div>
              </div>
              <div className="text-left">
                <h5 className="font-semibold text-emerald-300">BCSIR পরীক্ষিত</h5>
                <p className="text-sm text-gray-400">সরকারি অনুমোদিত</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-emerald-400 rounded-full"></div>
              </div>
              <div className="text-left">
                <h5 className="font-semibold text-emerald-300">ফ্রি ডেলিভারি</h5>
                <p className="text-sm text-gray-400">সারাদেশে</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 {footerContent.companyName}. সকল অধিকার সংরক্ষিত।
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-emerald-300 transition-colors duration-300">
                প্রাইভেসি পলিসি
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-300 transition-colors duration-300">
                শর্তাবলী
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-300 transition-colors duration-300">
                রিফান্ড নীতি
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}