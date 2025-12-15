// Load environment variables from .env so the Prisma CLI can access DATABASE_URL
require('dotenv').config({ path: './.env' });

const { defineConfig } = require('@prisma/config');

module.exports = defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
    // optional shadow DB URL for migrations; leave undefined if not set
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL || undefined,
  },
});
