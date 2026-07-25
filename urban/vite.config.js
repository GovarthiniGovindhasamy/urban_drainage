import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expose on local network — phones on the same WiFi can use the Network URL shown in terminal
    port: 5173,
  },
})

