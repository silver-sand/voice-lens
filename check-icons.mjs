import fs from 'fs';

const bundle = fs.readFileSync('dist/assets/index-DUZ4tJB-.js', 'utf8');

const patterns = [
  { name: 'Bold', path: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { name: 'Italic', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586' },
  { name: 'Zap', path: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { name: 'ChevronDown', path: 'M5 15l7-7 7 7' },
  { name: 'ChevronUp', path: 'M19 9l-7 7-7-7' },
  { name: 'Search', path: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { name: 'Brain', path: 'M12 3v1m6.364 1.636l-.707.707' },
  { name: 'CheckCircle', path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Link2/Connect', path: 'M13.828 10.172a4 4 0 00-5.656 0' },
  { name: 'Unlink', path: 'M10 19l-7-7m0 0l7-7m-7 7h18' },
  { name: 'Maximize', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2' },
  { name: 'Minimize', path: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'ArrowRight', path: 'M4 12l10-10' },
  { name: 'X', path: 'M18 6L6 18M6 6l12 12' },
  { name: 'Menu', path: 'M3 12h18M3 6h18M3 18h18' },
  { name: 'Sun', path: 'M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.31 11.31l1.41 1.41' },
  { name: 'Moon', path: 'M12 3a6 6 0 000 12H9a2 2 0 010-12h3z' },
  { name: 'Monitor', path: 'M12 19h9a2 2 0 002-2V7a2 2 0 00-2-2h-4M12 19l-9-9' },
  { name: 'Eye', path: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' },
  { name: 'EyeOff', path: 'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-5.06 5.94' },
  { name: 'ExternalLink', path: 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6' },
  { name: 'Shield', path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { name: 'Database', path: 'M4 7V4h16v3M9 20h6M12 4v16' },
  { name: 'Strikethrough', path: 'M4 12h16' },
  { name: 'Code', path: 'M16 18l6-6-6-6' },
  { name: 'List', path: 'M11 17H4M11 12H4M11 7H4M3 3h18v18H3z' },
  { name: 'Quote', path: 'M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V21c0 3 4 8 7 8z' },
  { name: 'Copy', path: 'M16 1H4a2 2 0 0 0-2 2v14h2M8 21h8M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6' },
];

for (const { name, path } of patterns) {
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'g');
  const matches = bundle.match(regex);
  if (matches) console.log(`Found ${name}: ${matches.length} occurrences`);
}