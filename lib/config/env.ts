import { z } from 'zod';

const EnvSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

  // Authentication & Security
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),
  ADMIN_PASSWORD: z.string().min(12, 'ADMIN_PASSWORD must be at least 12 characters').optional(),

  // OnchainKit Configuration
  NEXT_PUBLIC_ONCHAINKIT_API_KEY: z.string().optional(),
  NEXT_PUBLIC_CHAIN_ID: z.string().default('8453'),
  NEXT_PUBLIC_PROJECT_NAME: z.string().default('Unchained Tickets'),

  // Application URLs
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Development Mode
  NEXT_PUBLIC_DEV_MODE: z.string().default('true'),

  // Optional External Services
  SERPAPI_KEY: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * Validates and parses environment variables with strict type checking.
 * Throws an error if any required variables are missing or invalid.
 *
 * @throws {Error} If environment validation fails
 * @returns Validated environment configuration
 */
export function parseEnv(raw: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(raw);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');

    throw new Error(
      `❌ Invalid environment variables:\n${issues}\n\n` +
      'Please check your .env file and ensure all required variables are set correctly.'
    );
  }

  return parsed.data;
}

/**
 * Validated environment variables singleton.
 * Use this instead of process.env for type-safe access.
 */
export const env = parseEnv();
