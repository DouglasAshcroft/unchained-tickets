import Image from 'next/image';

interface EventHeaderProps {
  posterImageSrc: string;
  eventTitle: string;
}

export function EventHeader({ posterImageSrc, eventTitle }: EventHeaderProps) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-ink-800">
      <Image
        src={posterImageSrc}
        alt={eventTitle || 'Event poster'}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
        priority
      />
    </div>
  );
}
