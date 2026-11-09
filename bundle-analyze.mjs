import fs from 'fs';
import path from 'path';

const bundle = fs.readFileSync('dist/assets/index-DUZ4tJB-.js', 'utf8');

// Find all imported modules by looking at webpack/vite chunk references
const importMatches = bundle.match(/from\s+["']([^"']+)["']/g);
if (importMatches) {
  const uniqueImports = [...new Set(importMatches)];
  console.log("Import statements found:");
  uniqueImports.forEach(imp => console.log("  ", imp));
}

// Better: look for named exports/imports patterns
console.log("\n--- Module references ---");
const moduleRefs = [
  'react',
  'motion',
  'lucide-react',
  'wouter',
  'clsx',
  'tailwind-merge',
  'class-variance-authority',
  '@radix-ui',
  'uuid',
];

for (const mod of moduleRefs) {
  const count = (bundle.match(new RegExp(mod.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi")) || []).length;
  if (count > 0) console.log(`${mod}: ${count} references`);
}

// Try to use rollup plugin visualizer approach - find chunk sizes
console.log("\n--- Analyzing source map if available ---");
const mapFiles = fs.readdirSync('dist/assets').filter(f => f.endsWith('.map'));
if (mapFiles.length > 0) {
  console.log("Source maps found:", mapFiles);
} else {
  console.log("No source maps (as expected with sourcemap: false)");
}

// Look for the actual imported chunks
const chunkRefs = bundle.match(/__vite_ssr_import_\d+|import\.meta\.url|from\s+"[^"]*"/g);
if (chunkRefs) {
  const unique = [...new Set(chunkRefs)];
  console.log("\nChunk/import refs:", unique.slice(0, 20));
}