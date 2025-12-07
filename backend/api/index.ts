import { handle } from 'hono/vercel';
import app from '@/routes/routes';
import { withPrisma } from '@/common/prisma';

app.use('*', withPrisma);

export default handle(app);