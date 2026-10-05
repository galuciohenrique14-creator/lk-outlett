import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, 'publicimages');
const targetDir = path.join(projectRoot, 'public', 'images');

if (!fs.existsSync(sourceDir)) {
  process.exit(0);
}

fs.mkdirSync(targetDir, { recursive: true });

for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
  const sourcePath = path.join(sourceDir, entry.name);
  const targetPath = path.join(targetDir, entry.name);

  if (entry.isDirectory()) {
    fs.cpSync(sourcePath, targetPath, { recursive: true, force: true });
    continue;
  }

  fs.copyFileSync(sourcePath, targetPath);
}
