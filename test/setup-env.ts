import { config } from 'dotenv';

// e2e tests run against the test database: load .env.test before the app reads .env.
// Values already in process.env win over .env, so these take priority.
config({ path: '.env.test', override: true, quiet: true });

if (!process.env.DB_DATABASE?.endsWith('_test')) {
  throw new Error(
    `e2e tests must use a *_test database, got "${process.env.DB_DATABASE}". Check .env.test.`,
  );
}
