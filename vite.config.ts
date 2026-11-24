import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { VitePWA } from 'vite-plugin-pwa'

const base = (process.env.PAGES_BASE_PATH ?? '').replace(/\/$/, '') + '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      injectRegister: false,
      registerType: 'prompt',
      manifest: {
        id: base,
        name: 'Glühweinbar · Wangener Wengerter',
        short_name: 'Glühweinbar',
        lang: 'de',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#f5f1ea',
        theme_color: '#542335',
        icons: [192, 512].map((size) => ({
          src: base + 'icon-' + size + '.png',
          sizes: size + 'x' + size,
          type: 'image/png',
        })),
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,png,webmanifest}'],
        navigateFallback: base + 'index.html',
        clientsClaim: true,
      },
    }),
  ],
  build: { target: ['chrome111', 'edge111', 'firefox114', 'safari16.4'] },
})
