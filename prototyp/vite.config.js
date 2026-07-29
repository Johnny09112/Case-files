import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// UI přijde ve fázi 2.1 — konfigurace je zatím minimální.
// fs.allow: obsah (YAML) žije v kořeni monorepa, o úroveň nad vite rootem.
export default defineConfig({
  server: {
    // Port z prostředí (`PORT`), ať jde dev server spustit i vedle jiné běžící
    // instance; bez proměnné zůstává výchozí vite port.
    port: Number(process.env.PORT) || undefined,
    fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] },
  },
});
