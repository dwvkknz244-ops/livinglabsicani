import fs from 'fs';
import path from 'path';

const distServerDir = path.resolve('dist/server');
const wranglerJsonPath = path.resolve(distServerDir, 'wrangler.json');
const wranglerJsoncPath = path.resolve('wrangler.jsonc');

if (!fs.existsSync(distServerDir)) {
  fs.mkdirSync(distServerDir, { recursive: true });
}

// 1. Detect which main file was built (index.js or server.js)
const mainFile = fs.existsSync(path.resolve(distServerDir, 'index.js')) ? 'index.js' : 'server.js';
console.log(`Detected server entry file: ${mainFile}`);

// 2. Generate wrangler.json fallback in dist/server/
if (!fs.existsSync(wranglerJsonPath)) {
  console.log('Generating wrangler.json fallback for deployment...');
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
  console.log('wrangler.json already exists in dist/server.');
}

// 3. Dynamically update the main path in the root wrangler.jsonc
if (fs.existsSync(wranglerJsoncPath)) {
  console.log('Updating root wrangler.jsonc with the correct entry point...');
  let content = fs.readFileSync(wranglerJsoncPath, 'utf8');
  const mainPath = `dist/server/${mainFile}`;
  
  // Replace the "main" field dynamically using regex to preserve JSONC formatting
  content = content.replace(/"main":\s*"[^"]*"/, `"main": "${mainPath}"`);
  fs.writeFileSync(wranglerJsoncPath, content, 'utf8');
  console.log(`Updated root wrangler.jsonc main field to "${mainPath}"`);
} else {
  console.log('wrangler.jsonc not found in root.');
}
