import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' assert { type: 'json' } // Node >=17
import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({command}) => ({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [vue({
    template: {
      compilerOptions: {
        // 将所有带短横线的标签名都视为自定义元素
        isCustomElement: (tag) => tag.includes('-') && tag.startsWith("gij-")
      }
    }
  }),
  crx({ manifest }),],
  build: {
    rollupOptions: {
      input: {
        dashboard: 'src/app/index.html',
        preferences: "src/preferences/index.html"
      },
    },
    minify: command === "serve" ? false : true
  },
}))
