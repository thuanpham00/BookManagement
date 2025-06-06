// eslint-disable-next-line import/no-unresolved
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
// import { visualizer } from "rollup-plugin-visualizer"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3600, // có thể thay port khác
    proxy: {
      "/sendNotificationCallable": {
        target: "https://us-central1-readify-app-959fe.cloudfunctions.net",
        changeOrigin: true,
        secure: false
      }
    }
  },
  css: {
    devSourcemap: true // thể hiện đường dẫn src map css
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
      tinymce: path.resolve(__dirname, "node_modules/tinymce")
    }
  }
})
