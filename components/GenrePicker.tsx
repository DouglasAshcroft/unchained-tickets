'use client';

// TODO: Review and fix failure to render
// Issues:
// - Component does not appear on page despite being imported and used
// - May be related to conditional rendering based on genres.length === 0
// - May be related to data loading timing or empty genre counts
// - Consider simplifying logic and ensuring it renders even during loading states

import { useEffect, useState } from 'react';
import clsx from 'clsx';

type Genre = {
  name: string;
  slug: string;
  count: number;
};

type GenrePickerProps = {
  genres: Genre[];
};

export default function GenrePicker({ genres }: GenrePickerProps) {
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Make sticky after scrolling past header
      setIsSticky(window.scrollY > 300);

      // Update active genre based on scroll position
      const genreSections = genres.map((genre) => {
        const element = document.getElementById(`genre-${genre.slug}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          return { slug: genre.slug, top: rect.top, bottom: rect.bottom };
        }
        return null;
      }).filter(Boolean);

      const active = genreSections.find(
        (section) => section && section.top <= 200 && section.bottom > 200
      );

      if (active) {
        setActiveGenre(active.slug);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [genres]);

  const scrollToGenre = (slug: string) => {
    const element = document.getElementById(`genre-${slug}`);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (genres.length === 0) return null;

  return (
    <div
      className={clsx(
        'transition-all duration-300 z-30 mb-8',
        isSticky
          ? 'fixed top-0 left-0 right-0 bg-ink-900/95 backdrop-blur-md border-b border-acid-400/20 shadow-lg py-3'
          : 'relative'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          <span className="text-xs font-semibold text-grit-400 uppercase tracking-wider whitespace-nowrap mr-2">
            Jump to:
          </span>
          {genres.map((genre) => (
            <button
              key={genre.slug}
              onClick={() => scrollToGenre(genre.slug)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                activeGenre === genre.slug
                  ? 'bg-acid-400 text-ink-900'
                  : 'bg-ink-800/50 text-grit-300 hover:bg-ink-700/70 hover:text-bone-100 border border-acid-400/20 hover:border-acid-400/40'
              )}
            >
              {genre.name} ({genre.count})
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
