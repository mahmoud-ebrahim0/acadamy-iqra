import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Installable app (PWA): when a new version of the website is published, it is downloaded
// in the background and the page reloads automatically – visitors never get stuck on an old version.
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    // Also check for a new version every hour for tabs that stay open.
    if (registration) setInterval(() => registration.update(), 60 * 60 * 1000);
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
