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

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = new Error(data.error || 'API request failed');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
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

  // Venues endpoints
  async getVenueBySlug(slug: string) {
    return this.request<{ venue: any; events: any[] }>(`/api/venues/${slug}`);
  }

  // Artists endpoints
  async getArtistBySlug(slug: string) {
    return this.request<{ artist: any; events: any[] }>(`/api/artists/${slug}`);
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

  // Health check
  async healthCheck() {
    return this.request<any>('/api/health');
  }
}

const apiClient = new ApiClient(API_BASE_URL);

export { apiClient as api };
export default apiClient;
