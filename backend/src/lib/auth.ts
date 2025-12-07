import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { withPrisma } from './prisma.js';

export const auth = betterAuth({
  database: prismaAdapter(withPrisma, { provider: 'postgresql' }),
  trustedOrigins: ['http://localhost:8081', 'exp://*'],
  emailAndPassword: {
    enabled: true,
  },
});

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};