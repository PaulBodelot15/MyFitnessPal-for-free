import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'MyFitnessPal for free',
        short_name: 'MFP Free',
        description: 'Suivi nutritionnel et prise de masse — CIQUAL + Open Food Facts',
        theme_color: '#17b978',
        background_color: '#f2f4f7',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cache l'app shell (JS/CSS/HTML). Les appels Supabase et Open Food Facts
        // restent en réseau direct (network-first implicite, pas dans le cache) —
        // on ne veut pas de données périmées sur le journal alimentaire.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
})
