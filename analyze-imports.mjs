import { readFileSync, readdirSync } from 'fs';
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
const imports = new Map();

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^import\s+.*\s+from\s+['"]([^'"]+)['"]/);
    if (match) {
      const pkg = match[1];
      if (!pkg.startsWith('.') && !pkg.startsWith('@/') && !pkg.startsWith('../')) {
        imports.set(pkg, (imports.get(pkg) || 0) + 1);
      }
    }
  }
}

console.log('=== External package imports ===');
for (const [pkg, count] of [...imports.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`${pkg}: ${count} files`);
}
