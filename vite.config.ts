import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

function localDevSavePlugin(): Plugin {
  return {
    name: "local-dev-save-plugin",
    configureServer(server) {
      server.middlewares.use("/__api/save-content", (req, res) => {
        if (req.method === "POST") {
          const origin = req.headers.origin;
          if (origin) {
            try {
              const originUrl = new URL(origin);
              const isLocal = originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1";
              if (!isLocal) {
                res.writeHead(403, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Forbidden cross-origin request" }));
                return;
              }
            } catch {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid Origin header" }));
              return;
            }
          }

          let body = "";
          req.on("data", (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on("end", () => {
            try {
              const data = JSON.parse(body);
              if (
                data &&
                typeof data.content === "string" &&
                data.content.includes("export const INITIAL_SETTINGS") &&
                data.content.length > 500
              ) {
                const targetPath = resolve(__dirname, "src/data/portfolioData.ts");
                fs.writeFileSync(targetPath, data.content, "utf-8");
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true, message: "Saved to disk" }));
                return;
              }
            } catch (err) {
              console.error("[Local Dev Save] Error writing portfolioData.ts:", err);
            }
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid or untrusted payload" }));
          });
          return;
        }
        res.writeHead(405, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Method not allowed" }));
      });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [tailwindcss(), localDevSavePlugin()],
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
        notFound: resolve(__dirname, "404.html"),
      },
    },
  },
});
