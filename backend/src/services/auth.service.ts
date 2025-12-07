import { prisma } from './../common/prisma.js';
import { env } from './../common/env.js';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { HTTPException } from 'hono/http-exception';
import type { RegisterData, LoginData } from './../dtos/auth.dto.js';

const SALT_ROUNDS = 10;

export const authService = {
  async register(data: RegisterData) {
    const { email, password, name } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new HTTPException(409, { message: 'User with this email already exists' });
    }

    const hashedPassword = await hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
      },
    });

    // Não retornamos a senha
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async login(data: LoginData) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '7d' });

    return { token };
  },
};
