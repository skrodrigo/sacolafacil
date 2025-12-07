import 'dotenv/config';
import { z } from 'zod';

const envVariablesSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
});

export const env = envVariablesSchema.parse(process.env);

export type EnvVariables = z.infer<typeof envVariablesSchema>;