import { defineConfig } from "vite";
import path from "path";
import adminHandler from "./api/admin";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [{
    name: "local-admin-api",
    configureServer(server) {
      server.middlewares.use("/api/admin", (req, res, next) => {
        if (req.method !== "POST") return next();
        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => chunks.push(chunk));
        req.on("end", () => {
          let body: unknown;
          try {
            body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Invalid request" }));
            return;
          }
          void adminHandler({
            method: req.method,
            headers: {
              host: req.headers.host,
              origin: req.headers.origin,
              cookie: req.headers.cookie,
              "x-supabase-url": req.headers["x-supabase-url"],
              "x-supabase-publishable-key": req.headers["x-supabase-publishable-key"],
            },
            body,
          }, {
            status(code) { res.statusCode = code; return this; },
            setHeader(name, value) { res.setHeader(name, value); },
            json(value) { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(value)); },
          }).catch((error) => {
            server.config.logger.error("Local admin API request failed", { error });
            if (!res.headersSent) res.statusCode = 500;
            res.end(JSON.stringify({ error: "Admin request failed" }));
          });
        });
      });
    },
  }],
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
