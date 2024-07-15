import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/bin.ts'],
  format: ['cjs'],
  // sourcemap: true,
  // bundle: true,
  clean: true,
});
