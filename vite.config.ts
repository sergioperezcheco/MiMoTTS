import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Dev mode: proxy /api/tts to MiMo API (mirrors the Cloudflare Pages Function)
// Production: Cloudflare Pages serves /api/tts via functions/api/tts.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.VITE_MIMO_API_KEY || ''
  const baseUrl = env.VITE_MIMO_BASE_URL || 'https://token-plan-sgp.xiaomimimo.com/v1'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api/tts': {
          target: baseUrl.replace('/v1', ''),
          changeOrigin: true,
          rewrite: () => '/v1/chat/completions',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (apiKey) {
                proxyReq.setHeader('api-key', apiKey)
              }
            })
          },
        },
      },
    },
  }
})
