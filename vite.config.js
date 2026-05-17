import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'ovlogo-icon.png'],
      manifest: {
        name: 'Orașul Vede',
        short_name: 'OrasulVede',
        description: 'Raportează problemele din orașul tău. Vezi. Raportează. Schimbă.',
        start_url: '/acasa',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        lang: 'ro',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/ovlogo.png',
            sizes: '310x112',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Orașul Vede — Feed probleme',
          },
          {
            src: '/app-map.png',
            sizes: '1493x780',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Orașul Vede — Hartă interactivă',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
})
