import fs from 'fs';

const html = fs.readFileSync('bundle-report.html', 'utf8');
const dataMatch = html.match(/const data = (.*);/);
if (dataMatch) {
  const data = JSON.parse(dataMatch[1]);

  // Get second level after .pnpm
  const paths = new Set();
  for (const [uid, meta] of Object.entries(data.nodeMetas)) {
    const path = meta.id;
    if (path.includes('node_modules\\.pnpm\\')) {
      const idx = path.indexOf('node_modules\\.pnpm\\');
      const after = path.substring(idx + 'node_modules\\.pnpm\\'.length);
      const firstPart = after.split('\\')[0].split('/')[0];
      paths.add(firstPart);
    }
  }

  console.log('Packages under .pnpm:');
  [...paths].sort().forEach(p => console.log('  ' + p));
}