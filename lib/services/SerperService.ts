/**
 * Serper Service
 *
 * Fetches event data from Google Events API via Serper
 * Only used in production mode (NEXT_PUBLIC_EVENT_MODE=serper)
 */

import { prisma } from '@/lib/prisma';
import { isSerperEnabled } from '@/lib/config/eventMode';

interface SerperEvent {
  title: string;
  date: {
    start_date: string;
    when: string;
  };
  address: string[];
  venue: {
    name: string;
    link?: string;
  };
  link: string;
  ticket_info?: {
    source: string;
    link: string;
  }[];
  thumbnail?: string;
}

interface SerperResponse {
  events_results?: SerperEvent[];
}

export class SerperService {
  private apiKey: string;
  private baseUrl = 'https://serpapi.com/search.json';

  constructor() {
    this.apiKey = process.env.SERPER_API_KEY || '';
  }

  /**
   * Fetch events from Google Events API
   */
  async fetchEvents(query: string, location: string = 'United States'): Promise<SerperEvent[]> {
    if (!isSerperEnabled()) {
      console.log('⚠️  Serper is disabled in current mode');
      return [];
    }

    if (!this.apiKey) {
      console.warn('⚠️  SERPER_API_KEY not configured');
      return [];
    }

    try {
      const params = new URLSearchParams({
        engine: 'google_events',
        q: query,
        location,
        api_key: this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      const data: SerperResponse = await response.json();

      return data.events_results || [];
    } catch (error) {
      console.error('❌ Serper API error:', error);
      return [];
    }
  }

  /**
   * Sync Serper events to database
   */
  async syncEventsToDatabase(query: string, location?: string): Promise<number> {
    const serperEvents = await this.fetchEvents(query, location);
    let syncedCount = 0;

    for (const serperEvent of serperEvents) {
      try {
        // Find or create venue
        const venueName = serperEvent.venue.name;
        const venueSlug = this.slugify(venueName);

        let venue = await prisma.venue.findUnique({
          where: { slug: venueSlug },
        });

        if (!venue) {
          venue = await prisma.venue.create({
            data: {
              name: venueName,
              slug: venueSlug,
              city: this.extractCity(serperEvent.address),
              state: this.extractState(serperEvent.address),
            },
          });
        }

        // Parse date
        const startsAt = new Date(serperEvent.date.start_date);

        // Check if event already exists
        const existingEvent = await prisma.event.findFirst({
          where: {
            title: serperEvent.title,
            venueId: venue.id,
            startsAt,
          },
        });

        if (existingEvent) {
          continue; // Skip duplicates
        }

        // Extract ticket URL (prefer Ticketmaster)
        const ticketInfo = serperEvent.ticket_info?.find((t) =>
          t.source.toLowerCase().includes('ticketmaster')
        ) || serperEvent.ticket_info?.[0];

        // Create event
        await prisma.event.create({
          data: {
            title: serperEvent.title,
            startsAt,
            venueId: venue.id,
            status: 'published',
            posterImageUrl: serperEvent.thumbnail,
            externalLink: serperEvent.link,
            eventSource: 'serper',
            originalTicketUrl: ticketInfo?.link || serperEvent.link,
            venueContactEmail: null, // Will need to be populated separately
          },
        });

        syncedCount++;
      } catch (error) {
        console.error('❌ Failed to sync event:', serperEvent.title, error);
      }
    }

    return syncedCount;
  }

  /**
   * Helper: Create URL-safe slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Helper: Extract city from address array
   */
  private extractCity(address: string[]): string | null {
    if (!address || address.length === 0) return null;
    // Typically address format: ["Street", "City, State ZIP"]
    const cityState = address[address.length - 1];
    const parts = cityState.split(',');
    return parts[0]?.trim() || null;
  }

  /**
   * Helper: Extract state from address array
   */
  private extractState(address: string[]): string | null {
    if (!address || address.length === 0) return null;
    const cityState = address[address.length - 1];
    const parts = cityState.split(',');
    if (parts.length < 2) return null;
    const stateZip = parts[1].trim();
    return stateZip.split(' ')[0] || null;
  }
}

export const serperService = new SerperService();
