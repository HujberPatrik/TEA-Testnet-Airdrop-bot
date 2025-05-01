import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',  // Ellenőrizd, hogy ez a base path megfelelő-e
  publicDir: 'public', // Ellenőrizd, hogy ez a public könyvtár útvonala megfelelő-e
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    'process.env': {}
  }
});
