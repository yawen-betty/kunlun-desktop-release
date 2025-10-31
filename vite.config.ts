import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { createSvgIconsPlugin }from 'vite-plugin-svg-icons';
import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import path from 'path';

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [
    vue(),
    VueSetupExtend(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/svg')],
      symbolId: 'icon-[dir]-[name]'
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // additionalData: '@import "@/assets/styles/compute.scss"; @import "@/assets/styles/variable.scss"; '
      }
    }
  },
  resolve: {
    alias: {
      // 设置路径
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
