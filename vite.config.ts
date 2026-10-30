import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return;
          if (/\/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'react-vendor';
          if (id.includes('/node_modules/gsap/')) return 'gsap';
          if (id.includes('/node_modules/@supabase/')) return 'supabase';
          if (id.includes('/node_modules/framer-motion/')) return 'motion';
          if (/\/node_modules\/(redux|@reduxjs|immer)\//.test(id)) return 'state-vendor';
        },
      },
    },
  },
}));
