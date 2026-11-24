import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // We register the service worker ourselves (src/main.jsx) so a new version reloads the page.
      injectRegister: false,
      workbox: {
        // A new version takes over right away instead of waiting for every tab to close.
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Never answer API calls from the offline cache.
        navigateFallbackDenylist: [/^\/api\//],
      },
      includeAssets: ['favicon.svg', 'pwa-icon.svg', 'og-image.png'],
      manifest: {
        name: 'Tarteel Academy - أكاديمية ترتيل',
        short_name: 'Tarteel',
        description: 'تعلّم القرآن الكريم والتجويد مع معلمين من الأزهر الشريف - Learn the Quran with Al-Azhar teachers.',
        theme_color: '#7A1B29',
        background_color: '#FDFBF7',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ]
})
