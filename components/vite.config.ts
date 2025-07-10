import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
// @ts-expect-error for some reason typescript doesn't like this
import dts from 'unplugin-dts/vite';
import { defineConfig } from 'vite';
import { peerDependencies } from './package.json';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: [
        resolve(__dirname, 'index.ts'),
        resolve(__dirname, 'src/index.css'),
        resolve(__dirname, 'src/theme.css'),
      ],
      name: '@dinners/components',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [...Object.keys(peerDependencies)],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [react(), tailwindcss(), dts(), libInjectCss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
