import { websiteContent } from '@/shared/websiteContent';
import { Play } from 'lucide-react';

export default function Testimonials() {
  const { testimonials } = websiteContent;

  return (
    <section id="testimonials" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {testimonials.title}
          </h2>
          <p className="text-xl text-gray-600">
            {testimonials.subtitle}
          </p>
        </div>

        {/* Mobile: horizontal scroll with slight peek of next card */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 scrollbar-hide scroll-smooth pr-4">
            {testimonials.videos.map((video) => (
              <div
                key={video.id}
                className="min-w-[88%] snap-center bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="relative aspect-video bg-gray-200 group cursor-pointer">
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                      <p className="text-sm opacity-75">গ্রাহক পর্যালোচনা</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    আমাদের সন্তুষ্ট গ্রাহকের প্রকৃত অভিজ্ঞতা
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop/Tablet grid remains unchanged */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative aspect-video bg-gray-200 group cursor-pointer">
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                    <p className="text-sm opacity-75">গ্রাহক পর্যালোচনা</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  আমাদের সন্তুষ্ট গ্রাহকের প্রকৃত অভিজ্ঞতা
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="#order-form"
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            আপনিও এখনই অর্ডার করুন
          </a>
        </div>
      </div>
    </section>
  );
}
