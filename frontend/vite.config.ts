import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vercel from 'vite-plugin-vercel';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),vercel()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    // Les sourcemaps publient l'intégralité du code source aux visiteurs :
    // utile en développement, à proscrire sur un site public.
    sourcemap: process.env.NODE_ENV !== 'production',
  },
});
