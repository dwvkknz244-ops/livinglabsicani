import fs from 'fs';
import path from 'path';

const distServerDir = path.resolve('dist/server');
const wranglerJsonPath = path.resolve(distServerDir, 'wrangler.json');

if (!fs.existsSync(distServerDir)) {
  fs.mkdirSync(distServerDir, { recursive: true });
}

if (!fs.existsSync(wranglerJsonPath)) {
  console.log('Generating wrangler.json fallback for deployment...');
  // Detect if index.js or server.js is the main entry point
  const mainFile = fs.existsSync(path.resolve(distServerDir, 'index.js')) ? 'index.js' : 'server.js';
  const cfConfig = {
    compatibility_date: "2025-09-24",
    compatibility_flags: ["nodejs_compat"],
    name: "tanstack-start-app",
    main: mainFile,
    assets: { directory: "../client" },
    no_bundle: true
  };
  fs.writeFileSync(wranglerJsonPath, JSON.stringify(cfConfig, null, 2));
  console.log(`Generated wrangler.json pointing to ${mainFile}`);
} else {
  console.log('wrangler.json already exists, skipping fallback generation.');
}
