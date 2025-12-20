import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dotenv from 'dotenv';

dotenv.config();
let allowedHostsArray = process.env.ALLOWED_HOSTS?.split(',') ?? [];

export default defineConfig({
  plugins: [react()],
  dev: {
    sourcemap: true,
  },
  build: {
    sourcemap: true,
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: allowedHostsArray,
  },
});
