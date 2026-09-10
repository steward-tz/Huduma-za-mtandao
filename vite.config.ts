import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Netlify-compatible root config for the repository layout.
// The deploy configuration builds the full application from kituo-digitali/;
// the canonical project Vite config remains in kituo-digitali/vite.config.ts.
export default defineConfig({
  plugins: [react()],
  root: "kituo-digitali/client",
  publicDir: "kituo-digitali/client/public",
  resolve: {
    alias: {
      "@": "/kituo-digitali/client/src",
      "@shared": "/kituo-digitali/shared",
    },
  },
  build: {
    outDir: "../../dist/public",
    emptyOutDir: true,
  },
});
