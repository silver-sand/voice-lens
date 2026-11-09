import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function findFiles(dir, ext = '.tsx') {
  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findFiles(fullPath, ext));
    } else if (entry.name.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = findFiles('src');
const moduleSizes = new Map();

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^import\s+.*\s+from\s+['"]([^'"]+)['"]/);
    if (match) {
      const pkg = match[1];
      if (!pkg.startsWith('.') && !pkg.startsWith('@/') && !pkg.startsWith('../')) {
        const stats = statSync(file);
        moduleSizes.set(pkg, (moduleSizes.get(pkg) || 0) + stats.size);
      }
    }
  }
}

console.log('=== External package imports by total source file size ===');
for (const [pkg, size] of [...moduleSizes.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`${pkg}: ${(size/1024).toFixed(2)} KB`);
}
