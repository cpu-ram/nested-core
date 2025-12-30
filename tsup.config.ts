import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['frontend/src/nested-core/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  outDir: 'dist',
});
