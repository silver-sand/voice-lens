import fs from 'fs';
import path from 'path';

const bundleFiles = fs.readdirSync('dist/assets').filter(f => f.startsWith('index-') && f.endsWith('.js'));
if (bundleFiles.length === 0) {
  console.error('No bundle file found');
  process.exit(1);
}
const bundle = fs.readFileSync(path.join('dist/assets', bundleFiles[0]), 'utf8');

const knownPaths = {
  "Bold": "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
  "Italic": "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586",
  "Strikethrough": "M4 12h16",
  "Code": "M16 18l6-6-6-6",
  "List": "M11 17H4M11 12H4M11 7H4M3 3h18v18H3z",
  "Quote": "M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V21c0 3 4 8 7 8z",
  "Maximize": "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586",
  "Minimize": "M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "ChevronDown": "M5 15l7-7 7 7",
  "ChevronUp": "M19 9l-7 7-7-7",
  "ChevronRight": "M10 14 21 3",
  "Sparkles": "M12 3v1m6.364 1.636l-.707.707M21 12h-1",
  "Brain": "M12 3v1m6.364 1.636l-.707.707",
  "CheckCircle": "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  "Shield": "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  "Zap": "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  "Eye": "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z",
  "EyeOff": "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-5.06 5.94",
  "ExternalLink": "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6",
  "Menu": "M3 12h18M3 6h18M3 18h18",
  "Sun": "M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.31 11.31l1.41 1.41",
  "Moon": "M12 3a6 6 0 000 12H9a2 2 0 010-12h3z",
  "Monitor": "M12 19h9a2 2 0 002-2V7a2 2 0 00-2-2h-4M12 19l-9-9",
  "Search": "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  "Database": "M4 7V4h16v3M9 20h6M12 4v16",
  "ArrowRight": "M4 12l10-10",
  "ArrowLeft": "M15 19l-7-7 7-7",
  "Check": "M20 6 9 17 4 12",
  "Info": "M12 16v-4",
  "Users": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
  "Globe": "M21 21H3M21 12H3",
  "Code2": "M16 18l6-6-6-6",
};

console.log("=== SVG path data for known icons ===");
for (const [name, path] of Object.entries(knownPaths)) {
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = bundle.match(new RegExp(escaped, "g"));
  if (matches) console.log(`  ${name}: ${matches.length} occurrences`);
  else console.log(`  ${name}: NOT FOUND`);
}