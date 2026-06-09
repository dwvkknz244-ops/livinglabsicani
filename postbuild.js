import fs from 'fs';
import path from 'path';

const distServerDir = path.resolve('dist/server');
const generatedWranglerJson = path.resolve(distServerDir, 'wrangler.json');
const rootWranglerJson = path.resolve('wrangler.json');

console.log('Running postbuild script...');

if (fs.existsSync(generatedWranglerJson)) {
  console.log('Found generated wrangler.json in dist/server. Reading config...');
  const config = JSON.parse(fs.readFileSync(generatedWranglerJson, 'utf8'));

  // Update paths to be relative to the root directory
  const originalMain = config.main || 'index.js';
  config.main = `dist/server/${originalMain}`;
  
  if (config.assets && config.assets.directory) {
    config.assets.directory = 'dist/client';
  }

  // Write to root wrangler.json (Wrangler prioritizes wrangler.json over wrangler.jsonc)
  fs.writeFileSync(rootWranglerJson, JSON.stringify(config, null, 2), 'utf8');
  console.log(`Successfully generated root wrangler.json pointing to ${config.main} and dist/client`);
} else {
  console.error('Error: dist/server/wrangler.json not found! Build might be incomplete.');
  process.exit(1);
}
