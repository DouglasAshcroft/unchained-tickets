import type { ChecklistTaskId } from '@/lib/config/venueChecklist';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

interface ApiError extends Error {
  status?: number;
  data?: any;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = { error: text };
          }
        }
      }

      if (!response.ok) {
        const message = data?.error || data?.message || 'API request failed';
        const error: ApiError = new Error(message);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  // Auth endpoints
  async register(data: { email: string; password: string; name?: string }) {
    const response = await this.request<{ token: string; user: any }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    this.setToken(response.token);
    return response;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.request<{ token: string; user: any }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/api/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Generic POST method for endpoints not covered by specific methods
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Events endpoints
  async getEvents(search?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const query = params.toString();
    return this.request<any[]>(`/api/events${query ? `?${query}` : ''}`);
  }

  async getEventById(id: number) {
    return this.request<any>(`/api/events/${id}`);
  }

  async getVenues(params?: { location?: string; minCapacity?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.location) searchParams.append('location', params.location);
    if (params?.minCapacity) {
      searchParams.append('minCapacity', String(params.minCapacity));
    }
    const query = searchParams.toString();
    return this.request<any[]>(`/api/venues${query ? `?${query}` : ''}`);
  }

  async createEvent(data: {
    title: string;
    startsAt: string;
    endsAt?: string | null;
    venueId: number;
    primaryArtistId?: number | null;
    posterImageUrl?: string | null;
    externalLink?: string | null;
    mapsLink?: string | null;
    status?: 'draft' | 'published';
    seatMapId?: number;
    ticketTypes: Array<{
      name: string;
      description?: string | null;
      pricingType: 'general_admission' | 'reserved' | 'mixed';
      priceCents?: number | null;
      currency?: string;
      capacity?: number | null;
      salesStart?: string | null;
      salesEnd?: string | null;
      isActive?: boolean;
      perks?: Array<{
        name: string;
        description?: string | null;
        instructions?: string | null;
        quantity?: number;
      }>;
    }>;
  }) {
    return this.request<any>(`/api/events`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(
    id: number,
    data: Partial<{
      title: string;
      startsAt: string;
      endsAt: string | null;
      venueId: number;
      primaryArtistId: number | null;
      posterImageUrl: string | null;
      externalLink: string | null;
      mapsLink: string | null;
      status: 'draft' | 'published' | 'canceled' | 'completed';
    }>
  ) {
    return this.request<any>(`/api/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Venues endpoints
  async getVenueBySlug(slug: string) {
    return this.request<{ venue: any; events: any[] }>(`/api/venues/${slug}`);
  }

  async getVenueSeatMaps(slug: string) {
    return this.request<{ seatMaps: any[] }>(`/api/venues/${slug}/seat-maps`);
  }

  async createVenueSeatMap(slug: string, data: any) {
    return this.request<{ seatMap: any }>(`/api/venues/${slug}/seat-maps`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async setVenueChecklistItem(
    slug: string,
    task: ChecklistTaskId,
    complete: boolean
  ) {
    return this.request<{ task: string; complete: boolean }>(
      `/api/venues/${slug}/checklist/${task}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ complete }),
      }
    );
  }

  // Artists endpoints
  async getArtistBySlug(slug: string) {
    return this.request<{ artist: any; events: any[] }>(`/api/artists/${slug}`);
  }

  async getArtists(params?: { genre?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.genre) searchParams.append('genre', params.genre);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/artists${query ? `?${query}` : ''}`);
  }

  // Search endpoint
  async search(query: string) {
    return this.request<{ results: any[] }>(`/api/search?q=${encodeURIComponent(query)}`);
  }

  // Get all searchable data for client-side fuzzy search
  async getAllSearchableData() {
    const [events, venues, artists] = await Promise.all([
      this.getEvents(),
      this.request<any[]>('/api/venues'),
      this.request<any[]>('/api/artists'),
    ]);

    return {
      events: events.map((e: any) => ({
        type: 'event' as const,
        id: e.id,
        title: e.title,
        venue: e.venue?.name || '',
        startsAt: e.startsAt,
      })),
      venues: venues.map((v: any) => ({
        type: 'venue' as const,
        id: v.id,
        name: v.name,
        slug: v.slug,
        city: v.city,
        state: v.state,
      })),
      artists: artists.map((a: any) => ({
        type: 'artist' as const,
        id: a.id,
        name: a.name,
        slug: a.slug,
        genre: a.genre,
      })),
    };
  }

  // Profile endpoints
  async getProfile() {
    return this.request<any>('/api/profile');
  }

  async updateProfile(data: Partial<{
    name: string;
    phone: string;
    avatarUrl: string;
    bio: string;
    location: string;
    favoriteGenres: string[];
    locationEnabled: boolean;
    latitude: number;
    longitude: number;
  }>) {
    return this.request<any>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateProfileSettings(data: Partial<{
    notificationsEnabled: boolean;
    emailMarketing: boolean;
    theme: string;
    language: string;
    timezone: string;
  }>) {
    return this.request<any>('/api/profile/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async toggleFavoriteArtist(artistId: number) {
    return this.request<{ action: 'added' | 'removed'; artistId: number }>(
      '/api/profile/favorite-artists',
      {
        method: 'POST',
        body: JSON.stringify({ artistId }),
      }
    );
  }

  async getAdvocacyStats() {
    return this.request<{
      advocacyCount: number;
      totalVenuesReached: number;
      currentTier: number;
    }>('/api/profile/advocacy-stats');
  }

  async getVenueStaff() {
    return this.request<any[]>('/api/profile/venue-staff');
  }

  // Health check
  async healthCheck() {
    return this.request<any>('/api/health');
  }
}

const apiClient = new ApiClient(API_BASE_URL);

export { apiClient as api };
export default apiClient;
