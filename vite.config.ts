import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// @lovable.dev/vite-tanstack-config automatically adds @cloudflare/vite-plugin
// during build when `cloudflare` is not explicitly set to `false`.
// The plugin reads wrangler.jsonc, builds the worker entry, and creates
// .wrangler/deploy/config.json which `npx wrangler deploy` uses to find
// the built output — no postbuild script needed.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
