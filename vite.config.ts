import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// /api는 `npm run dev:api`(wrangler pages dev, 8788)로 프록시한다.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8788' } },
});
