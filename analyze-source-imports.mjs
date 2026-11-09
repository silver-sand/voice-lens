import { readFileSync } from 'fs';
import { globSync } from 'glob';

const files = globSync('src/**/*.tsx');
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
