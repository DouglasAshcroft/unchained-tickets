// Export Prisma types for use throughout the app
export type {
  User,
  UserRole,
  Event,
  EventStatus,
  Venue,
  Artist,
  Ticket,
  TicketStatus,
  Payment,
  PaymentStatus,
  PaymentMethod,
  NFTMint,
  NFTContract,
  Wallet,
  Session,
} from '@prisma/client';

// Custom API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Search result types
export interface SearchResult {
  type: 'event' | 'venue' | 'artist';
  id: number | string;
  title?: string;
  name?: string;
  slug?: string;
  venue?: string;
  date?: string;
  city?: string;
  state?: string;
  genre?: string;
}
