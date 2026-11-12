'use strict';

// Runs the read-only @real-site features against public Squarespace template
// demos. Each site has its own tag; the features need no account and change
// nothing on the sites. Usage: `npm run test:real-sites [-- @bailard @brine]`.

const { spawnSync } = require('child_process');

const SITES = {
  '@bailard': 'https://bailard-demo.squarespace.com',
  '@loam': 'https://loam-demo.squarespace.com',
  '@soony': 'https://soony-demo.squarespace.com',
  '@hester': 'https://hester-demo.squarespace.com',
  '@brine': 'https://brine-demo.squarespace.com',
};

const wanted = process.argv.slice(2);
const tags = wanted.length ? wanted : Object.keys(SITES);
let failed = 0;

for (const tag of tags) {
  if (!SITES[tag]) {
    console.error(`Unknown site tag ${tag}; known: ${Object.keys(SITES).join(', ')}`);
    process.exit(2);
  }
  console.log(`\n== ${tag} (${SITES[tag]})`);
  const result = spawnSync('npx', ['cucumber-js', '--config', 'cucumber.js'], {
    stdio: 'inherit',
    env: { ...process.env, LAUNCH_URL: SITES[tag], CUCUMBER_TAGS: `@real-site and ${tag}`, FEATURES: 'tests/features/real-sites', HEADLESS: 'true' },
  });
  if (result.status !== 0) failed++;
}

process.exit(failed ? 1 : 0);
