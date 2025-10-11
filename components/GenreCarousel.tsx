'use client';

// TODO: Research implementing Embla Carousel to replace custom components

import { useRef } from 'react';
import Link from 'next/link';
import EventCard from './EventCard';
import clsx from 'clsx';

export type EventListItem = {
  id: number;
  title: string;
  startsAt: string;
  createdAt: string;
  posterImageUrl?: string | null;
  externalLink?: string | null;
  mapsLink?: string | null;
  featured?: boolean;
  venue?: {
    id: number;
    name: string;
    slug: string;
    city?: string | null;
    state?: string | null;
  } | null;
};

type GenreCarouselProps = {
  title: string;
  events: EventListItem[];
  seeAllHref?: string;
  className?: string;
};

export function GenreCarousel({
  title,
  events,
  seeAllHref,
  className,
}: GenreCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector('div')?.offsetWidth || 350;
      const gap = 24; // 6 * 4px (gap-6)
      const scrollAmount = cardWidth + gap;

      if (container.scrollLeft <= 10) {
        // Seamless loop: jump to end without animation, then smoothly scroll to second-to-last
        container.scrollTo({ left: container.scrollWidth, behavior: 'auto' });
        setTimeout(() => {
          container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }, 10);
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector('div')?.offsetWidth || 350;
      const gap = 24; // 6 * 4px (gap-6)
      const scrollAmount = cardWidth + gap;

      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        // Seamless loop: jump to start without animation, then smoothly scroll forward
        container.scrollTo({ left: 0, behavior: 'auto' });
        setTimeout(() => {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }, 10);
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  if (events.length === 0) {
    return null;
  }

  return (
    <section className={clsx('mb-12', className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-bone-100">{title}</h2>

        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-sm text-acid-400 hover:text-hack-green transition-colors"
          >
            See All →
          </Link>
        )}
      </div>

      <div className="relative">
        {/* Left scroll button */}
        {events.length > 3 && (
          <button
            type="button"
            onClick={scrollLeft}
            className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-12 bg-ink-900/95 border-2 border-acid-400/30 text-acid-400 hover:bg-acid-400/30 hover:border-acid-400 hover:text-bone-100 transition-all opacity-20 hover:opacity-100 active:opacity-100 flex items-center justify-center rounded-lg shadow-2xl backdrop-blur-sm"
            style={{ height: '66.67%' }}
            aria-label="Scroll left"
          >
            <span className="text-3xl font-bold">‹</span>
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {events.map((event, index) => (
            <div
              key={event.id}
              className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start"
            >
              <EventCard event={event} priority={index < 3} />
            </div>
          ))}
        </div>

        {/* Right scroll button */}
        {events.length > 3 && (
          <button
            type="button"
            onClick={scrollRight}
            className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-12 bg-ink-900/95 border-2 border-acid-400/30 text-acid-400 hover:bg-acid-400/30 hover:border-acid-400 hover:text-bone-100 transition-all opacity-20 hover:opacity-100 active:opacity-100 flex items-center justify-center rounded-lg shadow-2xl backdrop-blur-sm"
            style={{ height: '66.67%' }}
            aria-label="Scroll right"
          >
            <span className="text-3xl font-bold">›</span>
          </button>
        )}
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

export default GenreCarousel;
