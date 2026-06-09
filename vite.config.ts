import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { cloudflare } from "@cloudflare/vite-plugin";

// Disable the lovable-internal cloudflare plugin (it fails silently on CI)
// and add it explicitly so build errors are visible.
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [cloudflare({ viteEnvironment: { name: "ssr" } })],
  },
});
