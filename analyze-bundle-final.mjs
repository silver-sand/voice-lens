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

          // Pattern: C:/.../node_modules/.pnpm/<package-name>/node_modules/...
          if (path.includes('node_modules\\.pnpm\\')) {
            const idx = path.indexOf('node_modules\\.pnpm\\');
            const after = path.substring(idx + 'node_modules\\.pnpm\\'.length);
            // The package name is everything before the next \node_modules
            const nextNodeModules = after.indexOf('\\node_modules\\');
            if (nextNodeModules !== -1) {
              pkg = after.substring(0, nextNodeModules);
            } else {
              // Fallback: take first segment
              pkg = after.split('\\')[0];
            }
          } else if (path.includes('node_modules/')) {
            const idx = path.indexOf('node_modules/');
            const after = path.substring(idx + 'node_modules/'.length);
            const nextNodeModules = after.indexOf('/node_modules/');
            if (nextNodeModules !== -1) {
              pkg = after.substring(0, nextNodeModules);
            } else {
              pkg = after.split('/')[0];
            }
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