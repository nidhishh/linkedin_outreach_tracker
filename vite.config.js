import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base path ('./') so generated asset URLs (CSS, JS, images)
  // work seamlessly on any hosting environment, including GitHub Pages subpaths
  // (e.g. https://nidhishh.github.io/linkedin_outreach_tracker/) and local dev.
  base: './',
})

