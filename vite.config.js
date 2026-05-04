import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const envApiTarget = env.VITE_API_PROXY_TARGET || env.VITE_API_BASE_URL;
  const apiTarget = envApiTarget?.startsWith('http')
    ? envApiTarget
    : 'http://3.237.223.11:8080';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // Proxy para evitar CORS durante desenvolvimento.
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
