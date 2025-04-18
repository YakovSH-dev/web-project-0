import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add the base path for GitHub Pages deployment
  // Replace '<your-repo-name>' with your actual GitHub repository name
  base: '/web-project-0/', 
})
