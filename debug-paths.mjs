import fs from 'fs';

const html = fs.readFileSync('bundle-report.html', 'utf8');
const dataMatch = html.match(/const data = (.*);/);
if (dataMatch) {
  const data = JSON.parse(dataMatch[1]);

  // Just print all unique path prefixes
  const paths = new Set();
  for (const [uid, meta] of Object.entries(data.nodeMetas)) {
    const path = meta.id;
    if (path.includes('node_modules')) {
      // Get first part after node_modules
      const idx = path.indexOf('node_modules');
      const after = path.substring(idx + 'node_modules'.length + 1);
      const firstPart = after.split('\\')[0].split('/')[0];
      paths.add(firstPart);
    }
  }

  console.log('Unique first parts after node_modules:');
  [...paths].sort().forEach(p => console.log('  ' + p));
}