import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Category } from '../types';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (categoryName: string) => void;
  selectedCategory: string | null;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onSelectCategory,
  selectedCategory,
}) => {
  const activeCategories = categories.filter(c => c.isActive !== false);

  return (
    <section id="categories-section" className="py-20 bg-[#FAF9F6] border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 text-[#9A7B4F] text-xs font-normal tracking-[0.25em] uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curation by Space</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#121214] tracking-wide">
              Architectural Collections
            </h2>
          </div>
          <p className="text-sm text-[#736D64] max-w-md mt-3 md:mt-0 font-light leading-relaxed">
            From sculpted seating systems to monolithic stone dining centerpieces, each category is defined by meticulous craftsmanship.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {activeCategories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? '' : cat.name)}
                className={`group relative overflow-hidden rounded-sm cursor-pointer aspect-[4/5] bg-[#121214] transition-all duration-500 transform hover:-translate-y-1.5 shadow-md ${
                  isSelected ? 'ring-2 ring-[#9A7B4F] shadow-lg' : ''
                }`}
              >
                {/* Background Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05] transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent transition-opacity group-hover:from-black/95" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between z-10">
                  <div className="flex justify-end">
                    <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center transform transition-all duration-300 group-hover:bg-[#C5A880] group-hover:text-[#121214] group-hover:rotate-45">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-normal text-white mb-1 leading-snug group-hover:text-[#DFCDAA] transition-colors tracking-wide">
                      {cat.name}
                    </h3>
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <p className="text-[11px] text-[#C5BEB3] line-clamp-1 font-light">
                        {cat.subcategories.slice(0, 3).join(' • ')}
                      </p>
                    )}
                    <span className="inline-block mt-3 text-[10px] font-normal tracking-[0.2em] uppercase text-[#C5A880] opacity-90 group-hover:opacity-100 transition-opacity">
                      {isSelected ? 'Viewing Category' : 'Explore Pieces'}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
