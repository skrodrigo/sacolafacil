import { prisma } from './../common/prisma.js';
import { Prisma, User } from './../generated/prisma/client.js';

export const authRepository = {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },
};
