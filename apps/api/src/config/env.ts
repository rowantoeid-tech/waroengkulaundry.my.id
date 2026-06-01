import { config } from 'dotenv';
import { resolve } from 'node:path';
import { z } from 'zod';

config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '.env') });

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  API_PORT: z.coerce.number().int().positive().default(3000),
  API_BASE_URL: z.string().url().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(16).optional(),
  CORS_ORIGINS: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export function getCorsOrigins(): string[] {
  const defaults = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://waroengkulaundry.my.id',
  ];
  if (!env.CORS_ORIGINS) return defaults;
  return [...defaults, ...env.CORS_ORIGINS.split(',').map((s) => s.trim())];
}
