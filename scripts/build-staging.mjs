/**
 * Staging Build Script
 * Sets PUBLIC_STAGING=true and STAGING=true to guarantee site-wide noindex, nofollow.
 */

import { spawnSync } from 'node:child_process';

process.env.PUBLIC_STAGING = 'true';
process.env.STAGING = 'true';

const result = spawnSync('npx astro build', {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}
