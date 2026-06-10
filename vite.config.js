import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` must match the GitHub repo name for GitHub Pages project sites.
// If you rename the repo, update this value to '/<new-repo-name>/'.
export default defineConfig({
  plugins: [react()],
  base: '/social-media-organizer/',
})
