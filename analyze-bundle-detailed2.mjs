import fs from 'fs';

const html = fs.readFileSync('bundle-report.html', 'utf8');
const dataMatch = html.match(/const data = (.*);/);
if (dataMatch) {
  const data = JSON.parse(dataMatch[1]);

  const partSizes = {};
  for (const [uid, part] of Object.entries(data.nodeParts)) {
    partSizes[uid] = part.gzipLength;
  }

  const packageSizes = {};
  for (const [uid, meta] of Object.entries(data.nodeMetas)) {
    if (meta.moduleParts) {
      for (const [chunk, partUid] of Object.entries(meta.moduleParts)) {
        if (partSizes[partUid]) {
          const size = partSizes[partUid];
          const path = meta.id;
          let pkg = 'unknown';

          if (path.includes('node_modules\\.pnpm\\')) {
            // Extract full package name like react@19.3.1 or framer-motion@14.9.1_...
            const match = path.match(/node_modules\\.pnpm\\([^\\]+)\\(node_modules|dist)/);
            if (match) pkg = match[1];
            else {
              const match2 = path.match(/node_modules\\.pnpm\\([^\\]+)$/);
              if (match2) pkg = match2[1];
            }
          } else if (path.includes('node_modules/')) {
            const match = path.match(/node_modules\/([^\/]+)/);
            if (match) pkg = match[1];
          } else if (path.includes('src/')) {
            pkg = 'src';
          }

          if (!packageSizes[pkg]) packageSizes[pkg] = { gzip: 0, count: 0 };
          packageSizes[pkg].gzip += size;
          packageSizes[pkg].count++;
        }
      }
    }
  }

  const sorted = Object.entries(packageSizes).sort((a, b) => b[1].gzip - a[1].gzip);

  console.log('=== BUNDLE SIZE BY PACKAGE (gzip) ===');
  let total = 0;
  sorted.forEach(([pkg, info]) => {
    console.log(pkg + ': ' + (info.gzip/1024).toFixed(2) + ' KB (' + info.count + ' modules)');
    total += info.gzip;
  });
  console.log('Total: ' + (total/1024).toFixed(2) + ' KB');
}