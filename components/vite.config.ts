import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import dts from 'unplugin-dts/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { peerDependencies } from './package.json';
import preserveDirectives from 'rollup-preserve-directives';

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: {
        'avatar': resolve(__dirname, 'src/components/ui/avatar.tsx'),
        'card': resolve(__dirname, 'src/components/ui/card.tsx'),
        'button': resolve(__dirname, 'src/components/ui/button.tsx'),
        'navigation-menu': resolve(__dirname, 'src/components/ui/navigation-menu.tsx'),
        'popover': resolve(__dirname, 'src/components/ui/popover.tsx'),
        'index': resolve(__dirname, 'src/index.ts'),
      },
      name: '@dinners/components',
      formats: ['es', 'cjs'],
      fileName: (format, entryname) => `${entryname}.${format}.js`,
    },
    rollupOptions: {
      external: ['react/jsx-runtime', 'react/jsx-dev-runtime', ...Object.keys(peerDependencies)],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [react(), tailwindcss(), dts({ bundleTypes: true }), libInjectCss(), preserveDirectives()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
