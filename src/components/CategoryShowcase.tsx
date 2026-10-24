import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Category } from '../types';

interface CategoryShowcaseProps {
  categories: Category[];
  onSelectCategory: (categoryName: string) => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  categories,
  onSelectCategory,
}) => {
  return (
    <section className="w-full bg-[#FAF8F5] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Header Card with Ambient Backdrop (matching top-right reference image) */}
        <div className="relative rounded-2xl overflow-hidden bg-[#3D332A] p-8 sm:p-12 text-white">
          <img
            src="https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=2000&q=85"
            alt="Dining Room Ambience"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45]"
          />
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs uppercase tracking-[0.25em] font-normal text-[#EAD0A8] block mb-2 font-sans">
              OUR COLLECTION
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-wide mb-3">
              Shop by Category
            </h2>
            <p className="text-sm text-[#F5F5F4] font-light">
              Explore our carefully curated furniture for every space.
            </p>
          </div>
        </div>

        {/* 5 Category Cards in a Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.slice(0, 5).map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="group bg-white rounded-xl border border-[#E7E5E4] p-4 text-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-[#B88E52]/60 flex flex-col items-center justify-between"
            >
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#FAF8F5] mb-4 flex items-center justify-center">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div>
                <h3 className="font-normal text-base text-[#1C1917] mb-1">
                  {cat.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs text-[#78716C] group-hover:text-[#B88E52] transition-colors font-normal">
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Split Promotional Banner */}
        <div className="rounded-2xl overflow-hidden border border-[#E7E5E4] bg-white grid grid-cols-1 md:grid-cols-12 shadow-sm">
          {/* Left: Living Room Image */}
          <div className="md:col-span-6 relative aspect-[16/9] md:aspect-auto min-h-[220px] bg-[#FAF8F5]">
            <img
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"
              alt="Furniture for Every Space"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right: Container */}
          <div className="md:col-span-6 bg-[#F6F2EC] p-8 sm:p-12 flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-[0.25em] font-normal text-[#8C7654] block mb-2 font-sans">
              MODERN &amp; ELEGANT
            </span>

            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1C1917] tracking-wide mb-3">
                  Furniture for Every Space
                </h3>
                <p className="text-xs sm:text-sm text-[#78716C] font-light tracking-wide">
                  Living Room &nbsp;|&nbsp; Bedroom &nbsp;|&nbsp; Dining &nbsp;|&nbsp; Storage
                </p>
              </div>

              {/* Round Tan Button with Arrow Right (Exact match from reference image) */}
              <button
                onClick={() => onSelectCategory('All')}
                className="w-12 h-12 rounded-full bg-[#B88E52] hover:bg-[#A57D43] text-white flex items-center justify-center shrink-0 shadow-md transition-transform hover:scale-105"
                aria-label="Explore Spaces"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
