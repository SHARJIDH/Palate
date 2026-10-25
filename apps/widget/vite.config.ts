import { defineConfig } from "vite";

// Builds a single self-executing file (dist/palate.js) that merchants load with
// <script src=".../palate.js" data-palate-key="..." async></script>.
// `vite dev` serves index.html, a stand-in storefront for local testing.
export default defineConfig({
  server: { port: 5173 },
  build: {
    lib: {
      entry: "src/index.ts",
      name: "Palate",
      formats: ["iife"],
      fileName: () => "palate.js",
    },
  },
});
