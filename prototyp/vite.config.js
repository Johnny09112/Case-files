import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// UI přijde ve fázi 2.1 — konfigurace je zatím minimální.
// fs.allow: obsah (YAML) žije v kořeni monorepa, o úroveň nad vite rootem.
export default defineConfig({
  server: {
    fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] },
  },
});
