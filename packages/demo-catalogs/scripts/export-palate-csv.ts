// Exports a demo catalog in the Palate CSV format (src/palate-csv.ts), the shape
// custom-store merchants upload in the console. Also writes the empty
// template merchants download.
//
//   pnpm --filter @palate/demo-catalogs export-palate fold
//   pnpm --filter @palate/demo-catalogs export-palate marlow
//   pnpm --filter @palate/demo-catalogs export-palate template
//
// Writes exports/<store>-palate.csv (or exports/palate-catalog-template.csv).
// Product URLs and images point at the demo stores app (STORES_URL, default
// http://localhost:3002), the way a real merchant's CSV points at their site.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fold } from "../src/fold/index.ts";
import { marlow } from "../src/marlow/index.ts";
import { productToSliceRow, sliceCsvTemplate, toSliceCsv } from "../src/palate-csv.ts";
import type { Catalog } from "../src/types.ts";

const catalogs: Record<string, Catalog> = { fold, marlow };
const [, , storeId = "fold"] = process.argv;
const STORES_URL = process.env.STORES_URL ?? "http://localhost:3002";

const root = path.resolve(import.meta.dirname, "..");
await mkdir(path.join(root, "exports"), { recursive: true });

if (storeId === "template") {
  const out = path.join(root, "exports", "palate-catalog-template.csv");
  await writeFile(out, sliceCsvTemplate());
  console.log(`Wrote ${path.relative(process.cwd(), out)}`);
  process.exit(0);
}

const catalog = catalogs[storeId];
if (!catalog) {
  console.error(`Unknown store "${storeId}". Known: ${Object.keys(catalogs).join(", ")}, template`);
  process.exit(1);
}

const rows = catalog.products.map((p) =>
  productToSliceRow(p, {
    url: (product) => `${STORES_URL}/${storeId}/p/${product.slug}`,
    image: (src) => (src.startsWith("http") ? src : `${STORES_URL}${src}`),
  }),
);
const out = path.join(root, "exports", `${storeId}-palate.csv`);
await writeFile(out, toSliceCsv(rows));
console.log(`Wrote ${rows.length} products to ${path.relative(process.cwd(), out)}`);
