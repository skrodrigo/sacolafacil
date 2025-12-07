import 'dotenv/config';
import { z } from 'zod';

const envVariablesSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envVariablesSchema.parse(process.env);

export type EnvVariables = z.infer<typeof envVariablesSchema>;