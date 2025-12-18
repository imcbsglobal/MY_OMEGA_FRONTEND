// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      // ❌ Disable PWA in dev
      devOptions: {
        enabled: false,
      },

      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
      ],

      manifest: {
        name: "Omega HRMS",
        short_name: "Omega",
        description: "Omega HR Management System",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",
        orientation: "portrait",

        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
}));
