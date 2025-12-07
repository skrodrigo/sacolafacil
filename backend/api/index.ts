import app from './../src/routes/routes.js';
import { withPrisma } from './../src/common/prisma.js';

app.use('*', withPrisma);

export const runtime = 'nodejs';

export default app;