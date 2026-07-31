import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.$connect()
  .then(() => { console.log('DB OK'); return p.$disconnect(); })
  .catch(e => { console.error('DB FAIL:', e.message); process.exit(1); });
