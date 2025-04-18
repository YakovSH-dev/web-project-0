import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    base: '/', // Default base for dev
  }

  // Apply specific base only for build command (for GitHub Pages)
  if (command === 'build') {
    // Replace '<your-repo-name>' with your actual GitHub repository name
    config.base = '/web-project-0/'
  }

  return config
})
