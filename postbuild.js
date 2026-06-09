import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const rootWranglerJson = path.resolve('wrangler.json');

console.log('Running postbuild script...');

// Helper to recursively find wrangler.json inside dist/
function findWranglerJson(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      const found = findWranglerJson(fullPath);
      if (found) return found;
    } else if (file === 'wrangler.json') {
      return fullPath;
    }
  }
  return null;
}

const foundWranglerJson = findWranglerJson(distDir);

if (foundWranglerJson) {
  console.log(`Found generated wrangler.json at: ${foundWranglerJson}`);
  const config = JSON.parse(fs.readFileSync(foundWranglerJson, 'utf8'));

  const serverBuildDir = path.dirname(foundWranglerJson);
  
  // Resolve main relative to the project root
  const originalMain = config.main || 'index.js';
  const resolvedMain = path.relative(process.cwd(), path.resolve(serverBuildDir, originalMain));
  config.main = resolvedMain;
  console.log(`Resolved main entry point to: ${config.main}`);

  // Resolve assets directory relative to the project root
  if (config.assets && config.assets.directory) {
    const resolvedAssets = path.relative(process.cwd(), path.resolve(serverBuildDir, config.assets.directory));
    config.assets.directory = resolvedAssets;
    console.log(`Resolved assets directory to: ${config.assets.directory}`);
  }

  // Write the resolved config to the project root wrangler.json
  fs.writeFileSync(rootWranglerJson, JSON.stringify(config, null, 2), 'utf8');
  console.log(`Successfully generated root wrangler.json`);
} else {
  console.error('Error: wrangler.json not found in any dist/ subdirectory! Build might be incomplete.');
  process.exit(1);
}
