
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';

import ws from 'ws';
neonConfig.webSocketConstructor = ws;

// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
neonConfig.poolQueryViaFetch = true

// Type definitions
// declare global {
//   var prisma: PrismaClient | undefined
// }

const connectionString = `${process.env.DATABASE_URL}`;

if (!process.env.DATABASE_URL) {
	console.warn('lib/prisma.js: WARNING - DATABASE_URL is not set');
} else {
	// don't print the full URL to avoid leaking secrets, just confirm presence
	console.info('lib/prisma.js: DATABASE_URL detected');
}

let prisma;
try {
	const adapter = new PrismaNeon({ connectionString });
	prisma = global.prisma || new PrismaClient({ adapter });
	if (process.env.NODE_ENV === 'development') global.prisma = prisma;
} catch (err) {
	console.error('lib/prisma.js: error creating Prisma client or adapter', err);
	// rethrow so upstream sees the failure
	throw err;
}

export default prisma;