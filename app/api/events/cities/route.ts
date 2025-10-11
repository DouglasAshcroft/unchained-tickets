import { NextResponse } from 'next/server';
import { eventRepository } from '@/lib/repositories/EventRepository';

export async function GET() {
  try {
    const cities = await eventRepository.getAvailableCities();

    return NextResponse.json({
      cities: cities.map((city) => ({
        city: city.city,
        state: city.state,
        slug: `${city.city.toLowerCase().replace(/\s+/g, '-')}-${city.state.toLowerCase()}`,
        latitude: city.latitude,
        longitude: city.longitude,
        count: city.count,
      })),
      total: cities.length,
    });
  } catch (error: any) {
    console.error('Get cities error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
