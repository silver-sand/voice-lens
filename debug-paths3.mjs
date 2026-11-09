import fs from 'fs';

const html = fs.readFileSync('bundle-report.html', 'utf8');
const dataMatch = html.match(/const data = (.*);/);
if (dataMatch) {
  const data = JSON.parse(dataMatch[1]);

  // Get all paths under node_modules
  const paths = new Set();
  for (const [uid, meta] of Object.entries(data.nodeMetas)) {
    const path = meta.id;
    if (path.includes('node_modules')) {
      paths.add(path);
    }
  }

  // Print first 50 paths
  console.log('First 50 paths:');
  [...paths].slice(0, 50).forEach(p => console.log('  ' + p));
}