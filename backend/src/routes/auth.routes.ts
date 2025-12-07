import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { authService } from '@/services/auth.service';
import { RegisterSchema, LoginSchema } from '@/dtos/auth.dto';
import { UserSchema } from '@/dtos/users.dto';
import { z } from 'zod';

const authRouter = new OpenAPIHono();

const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': { schema: RegisterSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'User created successfully',
      content: { 'application/json': { schema: UserSchema } },
    },
    409: { description: 'User already exists' },
  },
});

const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': { schema: LoginSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
      content: { 'application/json': { schema: z.object({ token: z.string() }) } },
    },
    401: { description: 'Invalid credentials' },
  },
});

authRouter.openapi(registerRoute, async (c) => {
  const data = c.req.valid('json');
  const newUser = await authService.register(data);
  return c.json(newUser, 201);
});

authRouter.openapi(loginRoute, async (c) => {
  const data = c.req.valid('json');
  const { token } = await authService.login(data);
  return c.json({ token }, 200);
});

export default authRouter;
