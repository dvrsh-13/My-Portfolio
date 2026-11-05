import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 3000,
    open: false,
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        cms: resolve(__dirname, "cms.html"),
      },
    },
  },
});
